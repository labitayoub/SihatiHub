import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({

    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    birthDate: {
        type: Date,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    role: { 
        type: String,
        required: true,
        enum: ['admin', 'medecin', 'patient', 'infirmier']
    },

    specialty: {
        type: String,
        required: function() {
            return this.role === 'medecin';
        }
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;