import MedicalRecord from '../models/MedicalRecord.js';
import Appointment from '../models/Appointment.js';
import Consultation from '../models/Consultation.js';
import DoctorSchedule from '../models/DoctorSchedule.js';
import Ordonnance from '../models/Ordonnance.js';
import { creerConsultation } from './consultationController.js';

// Fonction pour générer les créneaux horaires

function genererCreneaux(debut, fin, dureeConsultation) {
  const creneaux = [];
  let [heureDebut, minuteDebut] = debut.split(':').map(Number);
  let [heureFin, minuteFin] = fin.split(':').map(Number);
  
  let currentMinutes = heureDebut * 60 + minuteDebut;
  const finMinutes = heureFin * 60 + minuteFin;
  
  while (currentMinutes < finMinutes) {
    const heure = Math.floor(currentMinutes / 60);
    const minute = currentMinutes % 60;
    creneaux.push(`${String(heure).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    currentMinutes += dureeConsultation;
  }
  
  return creneaux;
}

export const definirHoraires = async (req, res) => {
  try {
    const { doctorId, horaires, dureeConsultation } = req.body;

    const schedule = await DoctorSchedule.findOneAndUpdate(
      { doctorId },
      { doctorId, horaires, dureeConsultation },
      { upsert: true, new: true }

      //upsert: true => create if not exists,, new: true => retourne le document mis à jour (pas l’ancien)
    );

    res.status(200).json({
      success: true,
      message: 'Horaires enregistrés avec succès',
      data: schedule
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};


export const voirCreneauxDisponibles = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir doctorId et date'
      });
    }

    // Récupérer les horaires du médecin
    const schedule = await DoctorSchedule.findOne({ doctorId });
    if (!schedule) {
      return res.status(404).json({ 
        success: false, 
        message: 'Médecin non trouvé ou horaires non définis' 
      });
    }

    // Déterminer le jour de la semaine
    const joursSemaine = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const jourIndex = new Date(date).getDay();
    const jourNom = joursSemaine[jourIndex];

    const horaireJour = schedule.horaires[jourNom];
    if (!horaireJour || !horaireJour.debut || !horaireJour.fin) {
      return res.status(200).json({ 
        success: true, 
        message: 'Médecin non disponible ce jour',
        data: [] 
      });
    }

    // Générer tous les créneaux possibles
    const tousLesCreneaux = genererCreneaux(
      horaireJour.debut, 
      horaireJour.fin, 
      schedule.dureeConsultation
    );

    // Récupérer les créneaux déjà réservés
    const rendezvousReserves = await Appointment.find({
      doctorId,
      date,
      status: { $in: ['en_attente', 'confirme'] }
    });

    const creneauxReserves = rendezvousReserves.map(rdv => rdv.time);

    // Filtrer les créneaux disponibles
    const creneauxDisponibles = tousLesCreneaux.filter(
      creneau => !creneauxReserves.includes(creneau)
    );

    res.status(200).json({
      success: true,
      data: creneauxDisponibles
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * @desc    PATIENT: Réserver un rendez-vous
 * @route   POST /rendez-vous/reserver
 * @access  Private/Patient
 */

export const reserverRendezVous = async (req, res) => {
  try {
    const { doctorId, patientId, date, time, motif } = req.body;

    // Validation simple
    if (!doctorId || !patientId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir doctorId, patientId, date et time'
      });
    }

    // VÉRIFICATION 1: Le patient a-t-il déjà un rendez-vous actif avec ce docteur ?
    const rendezvousExistant = await Appointment.findOne({
      doctorId,
      patientId,
      status: { $in: ['en_attente', 'confirme'] }
    });

    if (rendezvousExistant) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà un rendez-vous actif avec ce médecin',
        rendezVousExistant: {
          date: rendezvousExistant.date,
          time: rendezvousExistant.time,
          status: rendezvousExistant.status
        }
      });
    }

    // VÉRIFICATION 2: Le créneau est-il disponible ?
    const creneauPris = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $in: ['en_attente', 'confirme'] }
    });

    if (creneauPris) {
      return res.status(400).json({
        success: false,
        message: 'Ce créneau est déjà réservé par un autre patient'
      });
    }

    // Créer le rendez-vous (1 seul rendez-vous autorisé)
    const rendezVous = await Appointment.create({
      doctorId,
      patientId,
      date,
      time,
      motif
    });

    await rendezVous.populate('doctorId', 'name email');
    await rendezVous.populate('patientId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Rendez-vous réservé avec succès. Vous avez maintenant 1 consultation avec ce médecin.',
      data: rendezVous
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà un rendez-vous actif avec ce médecin ou ce créneau est déjà pris'
      });
    }
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * @desc    MÉDECIN/PATIENT: Voir ses rendez-vous
 * @route   GET /rendez-vous/mes-rendez-vous?userId=xxx&role=xxx
 * @access  Public (à protéger plus tard)
 */

export const mesRendezVous = async (req, res) => {
  try {
    const { userId, role } = req.query;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir userId et role (doctor ou patient)'
      });
    }

    const query = role === 'doctor' 
      ? { doctorId: userId } 
      : { patientId: userId };

    const rendezVous = await Appointment.find(query)
      .populate('doctorId', 'name email')
      .populate('patientId', 'name email')
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      count: rendezVous.length,
      data: rendezVous
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * @desc    MÉDECIN: Confirmer un rendez-vous
 * @route   PATCH /rendez-vous/:id/confirmer
 * @access  Public (à protéger plus tard)
 */

export const confirmerRendezVous = async (req, res) => {
  if (!req.body) req.body = {};
  try {
  const { id } = req.params;

    const rendezVous = await Appointment.findByIdAndUpdate(
      id,
      { status: 'confirme' },
      { new: true }
    ).populate('doctorId', 'name email')
     .populate('patientId', 'name email');

    if (!rendezVous) {
      return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });
    }

    // Création automatique du dossier médical si inexistant (patient uniquement)
  let medicalRecord = await MedicalRecord.findOne({ patient: rendezVous.patientId._id });

    if (!medicalRecord) {
      medicalRecord = await MedicalRecord.create({
        patient: rendezVous.patientId._id,
        consultations: []
      });
    }


    // Création de la consultation sans ordonnance (sera ajoutée plus tard)
  req.body.date = rendezVous.date;
  req.body.patient = rendezVous.patientId._id;
  req.body.doctor = rendezVous.doctorId._id;
  req.body.creneau = rendezVous.creneau || null; // si disponible
  req.body.status = 'en attente';
  // Pas d'ordonnance à ce stade
  
  await creerConsultation(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    ANNULER un rendez-vous
 * @route   DELETE /rendez-vous/:id/annuler
 * @access  Public (à protéger plus tard)
 */
export const annulerRendezVous = async (req, res) => {
  try {
    const { id } = req.params;

    const rendezVous = await Appointment.findByIdAndUpdate(
      id,
      { status: 'annule' },
      { new: true }
    ).populate('doctorId', 'name email')
     .populate('patientId', 'name email');

    if (!rendezVous) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Rendez-vous annulé',
      data: rendezVous
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * @desc    Obtenir les horaires d'un médecin
 * @route   GET /rendez-vous/horaires/:doctorId
 * @access  Public
 */
export const obtenirHoraires = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const schedule = await DoctorSchedule.findOne({ doctorId })
      .populate('doctorId', 'name email');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Horaires non trouvés pour ce médecin'
      });
    }

    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * @desc    Vérifier si un patient peut réserver avec un médecin
 * @route   GET /rendez-vous/peut-reserver/:doctorId/:patientId
 * @access  Private
 */
export const peutReserver = async (req, res) => {
  try {
    const { doctorId, patientId } = req.params;

    // Vérifier si le patient a déjà un rendez-vous actif 
    const rendezvousActif = await Appointment.findOne({
      doctorId,
      patientId,
      status: { $in: ['en_attente', 'confirme'] }
    });

    if (rendezvousActif) {
      return res.status(200).json({
        success: true,
        peutReserver: false,
        message: 'Vous avez déjà un rendez-vous actif avec ce médecin',
        rendezVousExistant: {
          id: rendezvousActif._id,
          date: rendezvousActif.date,
          time: rendezvousActif.time,
          status: rendezvousActif.status,
          motif: rendezvousActif.motif
        }
      });
    }

    res.status(200).json({
      success: true,
      peutReserver: true,
      message: 'Vous pouvez réserver un rendez-vous avec ce médecin'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
