import Ordonnance from '../models/Ordonnance.js';
import Consultation from '../models/Consultation.js';

// Ajout d'une ordonnance à une consultation (par le médecin)
export const ajouterOrdonnance = async (req, res) => {
  try {
  const { consultationId } = req.params;
    const { pharmacien, medicaments } = req.body;
    if (!pharmacien || !medicaments || !Array.isArray(medicaments) || medicaments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "L'ordonnance doit contenir un pharmacien et au moins un médicament."
      });
    }
    // Création de l'ordonnance
    const ordonnance = await Ordonnance.create({ pharmacien, medicaments, status: 'en attente' });
    // Association à la consultation
    const consultation = await Consultation.findByIdAndUpdate(
      consultationId,
      { ordonnance: ordonnance._id },
      { new: true }
    ).populate('ordonnance');
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation non trouvée' });
    }
    res.status(200).json({ success: true, data: consultation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
