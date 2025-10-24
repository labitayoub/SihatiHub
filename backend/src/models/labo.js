import mongoose from 'mongoose';

const laboSchema = new mongoose.Schema({

    nom: {
        type: String,
        required: true
    },
    adresse: {
        type: String,
        require: true
    },
        email: {
            type: String,
            required: true,
            unique: true
        }
    
},
{ timestamps: true});

export default mongoose.model("labo",laboSchema);