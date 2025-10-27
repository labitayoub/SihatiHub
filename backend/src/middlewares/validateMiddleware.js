
import Joi from 'joi';

/**
 * Middleware pour valider les données d'analyse avec Joi
 */
export const validateAnalyse = (req, res, next) => {
  const analyseSchema = Joi.object({
    consultation: Joi.string().required(),
    lab: Joi.string().required(),
    description: Joi.string().required(),
    status: Joi.string().valid('en attente', 'délivrée').default('en attente'),
    resultat: Joi.string().allow(''),
  });

  const { error } = analyseSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};



/**
 * Middleware pour valider les horaires du médecin
 */
export const validateSchedule = (req, res, next) => {
  const { doctorId, horaires, dureeConsultation } = req.body;

  // Vérifier doctorId
  if (!doctorId) {
    return res.status(400).json({
      success: false,
      message: 'doctorId est requis'
    });
  }

  // Vérifier horaires
  if (!horaires || typeof horaires !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'horaires doit être un objet'
    });
  }

  // Vérifier dureeConsultation
  if (dureeConsultation && (isNaN(dureeConsultation) || dureeConsultation < 5 || dureeConsultation > 120)) {
    return res.status(400).json({
      success: false,
      message: 'dureeConsultation doit être entre 5 et 120 minutes'
    });
  }

  // Vérifier chaque jour et format des heures
  const joursValides = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

  for (const jour in horaires) {
    if (!joursValides.includes(jour)) {
      return res.status(400).json({
        success: false,
        message: `Jour invalide: ${jour}. Utilisez: lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche`
      });
    }

    const horaire = horaires[jour];
    if (horaire && horaire.debut && horaire.fin) {
      if (!timeRegex.test(horaire.debut) || !timeRegex.test(horaire.fin)) {
        return res.status(400).json({
          success: false,
          message: `Format d'heure invalide pour ${jour}. Utilisez HH:MM (ex: 09:00)`
        });
      }

      // Vérifier que l'heure de début est avant l'heure de fin
      const [debutH, debutM] = horaire.debut.split(':').map(Number);
      const [finH, finM] = horaire.fin.split(':').map(Number);
      const debutMinutes = debutH * 60 + debutM;
      const finMinutes = finH * 60 + finM;

      if (debutMinutes >= finMinutes) {
        return res.status(400).json({
          success: false,
          message: `L'heure de début doit être avant l'heure de fin pour ${jour}`
        });
      }
    }
  }

  next();
};

/**
 * Middleware pour valider les données de réservation de rendez-vous
 */
export const validateAppointment = (req, res, next) => {
  const appointmentSchema = Joi.object({
    doctorId: Joi.string().hex().length(24).required().messages({
      'string.empty': 'Le champ doctorId ne peut pas être vide.',
      'any.required': 'Le champ doctorId est requis.'
    }),
    patientId: Joi.string().hex().length(24).required().messages({
      'string.empty': 'Le champ patientId ne peut pas être vide.',
      'any.required': 'Le champ patientId est requis.'
    }),
    date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
      'string.pattern.base': 'Le format de la date doit être YYYY-MM-DD.'
    }),
    time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
      'string.pattern.base': 'Le format de l\'heure doit être HH:MM.'
    }),
    motif: Joi.string().allow('').optional()
  });

  const { error } = appointmentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  next();
};

/**
 * Middleware pour valider les paramètres de requête des créneaux disponibles
 */
export const validateAvailableSlots = (req, res, next) => {
  const { doctorId, date } = req.query;

  if (!doctorId) {
    return res.status(400).json({
      success: false,
      message: 'doctorId est requis dans les paramètres de requête'
    });
  }

  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'date est requise dans les paramètres de requête'
    });
  }

  // Vérifier le format de la date
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({
      success: false,
      message: 'Format de date invalide. Utilisez YYYY-MM-DD (ex: 2025-10-20)'
    });
  }

  next();
};

/**
 * Middleware pour valider les paramètres de mes rendez-vous
 */
export const validateMyAppointments = (req, res, next) => {
  const { userId, role } = req.query;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'userId est requis dans les paramètres de requête'
    });
  }

  if (!role) {
    return res.status(400).json({
      success: false,
      message: 'role est requis (doctor ou patient)'
    });
  }

  if (role !== 'doctor' && role !== 'patient') {
    return res.status(400).json({
      success: false,
      message: 'role doit être "doctor" ou "patient"'
    });
  }

  next();
};
