import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true

    },
    horaires: {

        lundi: { debut: String, fin: String },
        mardi: { debut: String, fin: String },
        mercredi: { debut: String, fin: String },
        jeudi: { debut: String, fin: String },
        vendredi: { debut: String, fin: String },
        samedi: { debut: String, fin: String },
    },
    dureeConsultation: {
        type: Number,
        required: true,
        default: 60
    }
}, { timestamps: true });
export default mongoose.model('DoctorSchedule', scheduleSchema);