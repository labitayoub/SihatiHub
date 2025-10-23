import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['en_attente', 'confirme', 'annule', 'termine'],
        default: 'en_attente'
    },
    motif: String
}, { timestamps: true });


appointmentSchema.index({ doctorId: 1, date: 1, time: 1 }, { unique: true });

appointmentSchema.index(
    { doctorId: 1, patientId: 1, status: 1 }, 
    { 
        unique: true, 
        // https://www.mongodb.com/docs/manual/core/index-partial/
        partialFilterExpression: { 
            status: { $in: ['en_attente', 'confirme'] } 
        }
    }
);

export default mongoose.model('Appointment', appointmentSchema);
