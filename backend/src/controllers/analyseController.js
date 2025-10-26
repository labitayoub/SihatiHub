
import Analyse from "../models/Analyse";
import Consultation from "../models/Consultation.js";

// Confirmer le statut de l'analyse (par le laboratoire)
export const confirmerStatutAnalyse = async (req, res) => {
		try {
			const { id } = req.params;
			const { status, resultat } = req.body;
			if (!status || !resultat) {
				return res.status(400).json({ success: false, message: 'Le statut et le résultat sont requis.' });
			}
			const analyse = await Analyse.findByIdAndUpdate(id, { status, resultat }, { new: true });
			if (!analyse) {
				return res.status(404).json({ success: false, message: 'Analyse non trouvée' });
			}
			res.status(200).json({ success: true, data: analyse });
		} catch (error) {
			res.status(500).json({ success: false, error: error.message });
		}
	};

// Récupérer toutes les analyses liées au laboratoire connecté
export const getAnalysesLab = async (req, res) => {
	try {
		const labId = req.user.id;
		const analyses = await Analyse.find({ lab: labId })
			.populate({
				path: 'consultation',
				select: 'date patient doctor',
				populate: [
					{ path: 'patient', select: 'firstName lastName' },
					{ path: 'doctor', select: 'firstName lastName specialty' }
				]
			});
		res.status(200).json({ success: true, data: analyses });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
};

// Ajouter une analyse à une consultation (par le médecin)
export const ajouterAnalyse = async (req, res) => {
		try {
			const { consultationId } = req.params;
				const { lab, description } = req.body;
				if (!lab || !description) {
					return res.status(400).json({
						success: false,
						message: "L'analyse doit contenir un laboratoire et une description."
					});
				}
				// Création de l'analyse (resultat vide, à remplir par le lab)
				const analyse = await Analyse.create({
					consultation: consultationId,
					lab,
					description,
					resultat: '',
					status: 'en attente'
				});
			// Association à la consultation
			const consultation = await Consultation.findByIdAndUpdate(
				consultationId,
				{ analyse: analyse._id },
				{ new: true }
			).populate('analyse');
			if (!consultation) {
				return res.status(404).json({ success: false, message: 'Consultation non trouvée' });
			}
			res.status(200).json({ success: true, data: consultation });
		} catch (error) {
			res.status(500).json({ success: false, error: error.message });
		}
	};

