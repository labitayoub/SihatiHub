import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import Appointment from '../src/models/Appointment.js';
import DoctorSchedule from '../src/models/DoctorSchedule.js';
import User from '../src/models/User.js';

let mongoServer;

const createToken = (payload) => `Bearer ${jwt.sign(payload, process.env.JWT_SECRET)}`;

const buildUser = async (overrides = {}) => {
  const defaults = {
    firstName: 'Test',
    lastName: 'User',
    email: `${new mongoose.Types.ObjectId().toString()}@test.dev`,
    password: 'hashed-password',
    phone: '0600000000',
    birthDate: new Date('1990-01-01'),
    address: '123 Test Street',
    role: 'patient'
  };

  const payload = { ...defaults, ...overrides };
  return User.create(payload);
};

const formatDate = (date) => date.toISOString().split('T')[0];

const nextDateForDay = (targetDay) => {
  const today = new Date();
  const result = new Date(today);
  const diff = (targetDay - today.getDay() + 7) % 7 || 7;
  result.setDate(today.getDate() + diff);
  return result;
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: 'sihatihub-test' });
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  await Promise.all([
    Appointment.deleteMany({}),
    DoctorSchedule.deleteMany({}),
    User.deleteMany({})
  ]);
});

describe('Appointment routes', () => {
  it('allows a doctor to define availability slots', async () => {
    const doctor = await buildUser({ role: 'medecin', specialty: 'General Medicine' });
    const token = createToken({ id: doctor._id.toString(), role: 'doctor' });

    const response = await request(app)
      .post('/rendez-vous/horaires')
      .set('Authorization', token)
      .send({
        doctorId: doctor._id.toString(),
        horaires: {
          lundi: { debut: '09:00', fin: '12:00' }
        },
        dureeConsultation: 60
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);

    const storedSchedule = await DoctorSchedule.findOne({ doctorId: doctor._id });
    expect(storedSchedule).toBeTruthy();
    expect(storedSchedule.horaires.lundi.debut).toBe('09:00');
    expect(storedSchedule.dureeConsultation).toBe(60);
  });

  it('returns only free slots for a doctor', async () => {
    const doctor = await buildUser({ role: 'medecin', specialty: 'Cardiology' });
    const token = createToken({ id: doctor._id.toString(), role: 'patient' });
    const mondayDate = formatDate(nextDateForDay(1));

    await DoctorSchedule.create({
      doctorId: doctor._id,
      horaires: {
        lundi: { debut: '09:00', fin: '11:00' }
      },
      dureeConsultation: 60
    });

    await Appointment.create({
      doctorId: doctor._id,
      patientId: (await buildUser())._id,
      date: mondayDate,
      time: '10:00'
    });

    const response = await request(app)
      .get('/rendez-vous/disponibles')
      .set('Authorization', token)
      .query({ doctorId: doctor._id.toString(), date: mondayDate });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toContain('09:00');
    expect(response.body.data).not.toContain('10:00');
  });

  it('books a slot for a patient', async () => {
    const doctor = await buildUser({ role: 'medecin', specialty: 'Dermatology' });
    const patient = await buildUser({ role: 'patient' });
    const token = createToken({ id: patient._id.toString(), role: 'patient' });
    const mondayDate = formatDate(nextDateForDay(1));

    const response = await request(app)
      .post('/rendez-vous/reserver')
      .set('Authorization', token)
      .send({
        doctorId: doctor._id.toString(),
        patientId: patient._id.toString(),
        date: mondayDate,
        time: '09:00',
        motif: 'Consultation de suivi'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    const stored = await Appointment.findOne({ doctorId: doctor._id, patientId: patient._id });
    expect(stored).toBeTruthy();
    expect(stored.date).toBe(mondayDate);
    expect(stored.time).toBe('09:00');
  });

  it('prevents multiple active appointments with the same doctor', async () => {
    const doctor = await buildUser({ role: 'medecin', specialty: 'Pediatrics' });
    const patient = await buildUser({ role: 'patient' });
    const token = createToken({ id: patient._id.toString(), role: 'patient' });
    const mondayDate = formatDate(nextDateForDay(1));

    const payload = {
      doctorId: doctor._id.toString(),
      patientId: patient._id.toString(),
      date: mondayDate,
      time: '09:00'
    };

    const firstResponse = await request(app)
      .post('/rendez-vous/reserver')
      .set('Authorization', token)
      .send(payload);

    expect(firstResponse.statusCode).toBe(201);

    const secondResponse = await request(app)
      .post('/rendez-vous/reserver')
      .set('Authorization', token)
      .send(payload);

    expect(secondResponse.statusCode).toBe(400);
    expect(secondResponse.body.success).toBe(false);
    expect(secondResponse.body.message).toMatch(/déjà un rendez-vous actif/i);
  });
});
