import mongoose, { Schema } from "mongoose";

const roleSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ['admin', 'medecin', 'patient', 'infirmier']
    },
    permissions: [{
        type: String,
        enum: [
            'create_user',
            'read_user',
            'update_user',
            'delete_user',
            'create_appointment',
            'read_appointment',
            'update_appointment',
            'delete_appointment',
            'manage_roles'
        ]
    }],
    description: {
        type: String
    }
}, {
    timestamps: true
});

const Role = mongoose.model('Role', roleSchema);

export default Role;