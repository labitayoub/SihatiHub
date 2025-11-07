# 📄 Documentation - Système de Gestion de Documents avec MinIO

## 🎯 Vue d'ensemble

Le système de gestion de documents permet aux laboratoires, médecins et administrateurs de télécharger, gérer et partager des documents médicaux (résultats d'analyses, ordonnances, etc.) stockés dans MinIO.

## 📁 Structure des fichiers créés

```
backend/
├── src/
│   ├── controllers/
│   │   └── documentController.js     # Logique métier des documents
│   ├── models/
│   │   └── Document.js               # Modèle MongoDB pour documents
│   ├── routes/
│   │   └── documentRoute.js          # Routes API documents
│   ├── services/
│   │   └── minioService.js           # Service MinIO (upload/download/delete)
│   └── middlewares/
│       └── uploadMiddleware.js       # Configuration Multer
```

## 🔧 Configuration

### Variables d'environnement (.env.docker)

```env
# MinIO Configuration
MINIO_HOST=minio
MINIO_PORT=9100
MINIO_USE_SSL=false
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=password
MINIO_BUCKET_DOCUMENTS=sihati-documents
MINIO_BUCKET_LAB_REPORTS=sihati-lab-reports
MINIO_BUCKET_ORDONNANCES=sihati-ordonnances

# Upload Configuration
MAX_FILE_SIZE=20971520  # 20MB
ALLOWED_DOCUMENT_TYPES=application/pdf,image/jpeg,image/png,image/jpg
```

## 🗄️ Modèle de données

### Document Schema

```javascript
{
  titre: String,                    // Titre du document
  type: String,                     // 'analyse' | 'ordonnance' | 'consultation' | 'autre'
  fileName: String,                 // Nom unique dans MinIO
  originalName: String,             // Nom original du fichier
  fileUrl: String,                  // URL signée temporaire
  bucketName: String,               // Bucket MinIO
  mimetype: String,                 // Type MIME
  fileSize: Number,                 // Taille en bytes
  analyse: ObjectId,                // Référence à une analyse
  ordonnance: ObjectId,             // Référence à une ordonnance
  consultation: ObjectId,           // Référence à une consultation
  patient: ObjectId (required),     // Patient concerné
  uploadedBy: ObjectId (required),  // Utilisateur qui a uploadé
  description: String,              // Description
  tags: [String],                   // Tags pour recherche
  isPublic: Boolean,                // Visibilité
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 API Routes

### 1. Créer un document (Upload)

**Endpoint:** `POST /documents/create`

**Authentification:** Bearer Token (Lab/Médecin/Admin)

**Body (multipart/form-data):**
```
titre: "Analyse sanguine complète"
type: "analyse"
patient: "6751234567890abcdef12345"
analyse: "6751234567890abcdef67890"     (optionnel)
ordonnance: "..."                       (optionnel)
consultation: "..."                     (optionnel)
description: "Résultats d'analyse"
tags: ["sanguin", "complet"]            (optionnel)
isPublic: false                          (optionnel)
file: [Fichier PDF/Image]
```

**Réponse:**
```json
{
  "success": true,
  "message": "Document créé avec succès",
  "data": {
    "_id": "675...",
    "titre": "Analyse sanguine complète",
    "type": "analyse",
    "fileName": "1730899200000_uuid.pdf",
    "originalName": "resultats.pdf",
    "fileUrl": "http://localhost:9100/...",
    "bucketName": "sihati-lab-reports",
    "mimetype": "application/pdf",
    "fileSize": 102400,
    "patient": {...},
    "uploadedBy": {...},
    "analyse": {...},
    "createdAt": "2025-11-06T10:00:00.000Z"
  }
}
```

### 2. Récupérer tous les documents

**Endpoint:** `GET /documents?type=analyse&patient=675...&page=1&limit=10`

**Authentification:** Bearer Token

**Query Params:**
- `type` (optionnel): analyse, ordonnance, consultation, autre
- `patient` (optionnel): ID du patient
- `page` (optionnel, défaut: 1)
- `limit` (optionnel, défaut: 10)

### 3. Récupérer un document par ID

**Endpoint:** `GET /documents/:id`

**Authentification:** Bearer Token

### 4. Récupérer les documents d'un patient

**Endpoint:** `GET /documents/user/:userId?type=analyse`

**Authentification:** Bearer Token

### 5. Récupérer les documents par analyse

**Endpoint:** `GET /documents/analyse/:analyseId`

**Authentification:** Bearer Token

### 6. Mettre à jour un document

**Endpoint:** `PATCH /documents/:id`

**Authentification:** Bearer Token (Lab/Médecin/Admin)

**Body (multipart/form-data):**
```
titre: "Nouveau titre"      (optionnel)
description: "..."          (optionnel)
tags: ["tag1", "tag2"]      (optionnel)
isPublic: true              (optionnel)
file: [Nouveau fichier]     (optionnel)
```

### 7. Supprimer un document

**Endpoint:** `DELETE /documents/:id`

**Authentification:** Bearer Token (Lab/Médecin/Admin)

## 📝 Exemples d'utilisation

### Avec cURL

```bash
# Créer un document
curl -X POST http://localhost:3001/documents/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "titre=Analyse sanguine" \
  -F "type=analyse" \
  -F "patient=6751234567890abcdef12345" \
  -F "analyse=6751234567890abcdef67890" \
  -F "description=Résultats complets" \
  -F "file=@./resultats.pdf"

# Récupérer tous les documents d'un patient
curl -X GET "http://localhost:3001/documents/user/6751234567890abcdef12345" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Avec Postman

1. **Créer un document:**
   - Method: POST
   - URL: `http://localhost:3001/documents/create`
   - Headers: 
     - `Authorization: Bearer YOUR_TOKEN`
   - Body: `form-data`
     - titre: "Analyse sanguine"
     - type: "analyse"
     - patient: "6751234567890abcdef12345"
     - file: [Select File]

2. **Récupérer les documents:**
   - Method: GET
   - URL: `http://localhost:3001/documents?type=analyse`
   - Headers: 
     - `Authorization: Bearer YOUR_TOKEN`

## 🔐 Sécurité & Permissions

### Rôles autorisés

- **Créer un document:** Lab, Médecin, Admin
- **Consulter les documents:** Tous les utilisateurs authentifiés
- **Modifier un document:** Créateur du document ou Admin
- **Supprimer un document:** Créateur du document ou Admin

### URLs signées

Les URLs de fichiers sont **temporaires** et expirent après 1 heure (3600 secondes). Le système régénère automatiquement les URLs lors de chaque requête.

## 🎨 Buckets MinIO

Le système crée automatiquement 3 buckets au démarrage:

1. **sihati-documents** - Documents généraux
2. **sihati-lab-reports** - Résultats d'analyses
3. **sihati-ordonnances** - Ordonnances médicales

## 🧪 Test de fonctionnement

### Vérifier que MinIO est accessible

```bash
# Console MinIO
http://localhost:9001

# Credentials:
# Username: admin
# Password: password
```

### Tester l'upload

```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const form = new FormData();
form.append('titre', 'Test Document');
form.append('type', 'analyse');
form.append('patient', 'PATIENT_ID');
form.append('file', fs.createReadStream('./test.pdf'));

axios.post('http://localhost:3001/documents/create', form, {
  headers: {
    ...form.getHeaders(),
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
.then(response => console.log(response.data))
.catch(error => console.error(error));
```

## 🐛 Gestion des erreurs

### Erreurs courantes

1. **"Aucun fichier fourni"** - Vérifiez que le champ `file` est bien présent
2. **"Type de fichier non autorisé"** - Vérifiez `ALLOWED_DOCUMENT_TYPES`
3. **"Failed to upload file"** - Vérifiez que MinIO est accessible
4. **"Non autorisé"** - Vérifiez les permissions de l'utilisateur

## 📊 Workflow recommandé

### Pour un laboratoire

1. Le médecin crée une analyse dans une consultation
2. Le labo reçoit la demande
3. Le labo effectue l'analyse
4. **Le labo upload le résultat PDF avec cette API**
5. Le document est lié à l'analyse
6. Le patient peut consulter le résultat

```javascript
// Exemple: Labo upload un résultat
POST /documents/create
{
  titre: "Résultat analyse sanguine",
  type: "analyse",
  patient: "PATIENT_ID",
  analyse: "ANALYSE_ID",
  file: resultat.pdf
}
```

## 🔄 Intégration avec les analyses existantes

Pour améliorer le système d'analyses existant, vous pouvez:

1. **Ajouter un champ dans le modèle Analyse:**

```javascript
// backend/src/models/Analyse.js
documents: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Document'
}]
```

2. **Mettre à jour le controller d'analyse:**

```javascript
// Après upload du document
await Analyse.findByIdAndUpdate(
  analyseId,
  { $push: { documents: document._id } }
);
```

## 📞 Support

Pour toute question concernant cette fonctionnalité, vérifiez:
- Les logs du serveur backend
- Les logs MinIO dans Docker
- La console MinIO (http://localhost:9001)

---

**Version:** 1.0.0  
**Date:** 6 Novembre 2025  
**Auteur:** SihatiHub Team
