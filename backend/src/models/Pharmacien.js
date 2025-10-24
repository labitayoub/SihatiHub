import mongoose from 'mongoose';

const pharmacienSchema = new mongoose.Schema({

nom: {
    type: String,
    required: true
},
adresse: {
    type:String,
    required: true
},
email: {
    type: String,
    require: true,
    unique: true
}

},
{timestamps: true });

export default mongoose.model("Pharmacien", pharmacienSchema);