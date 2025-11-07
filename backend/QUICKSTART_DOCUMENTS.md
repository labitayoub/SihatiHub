# 🚀 Guide de Démarrage - API Documents

## ✅ Prérequis

Assurez-vous que Docker est en cours d'exécution avec tous les services :

```bash
docker-compose up -d
```

Vérifiez que les services sont actifs :
- Backend: http://localhost:3001
- MinIO Console: http://localhost:9001
- MongoDB: localhost:27018

## 📦 Installation des dépendances

Le package `uuid` a déjà été installé, mais si vous rencontrez des problèmes :

```bash
cd backend
npm install
```

## 🧪 Tests Rapides

### Option 1: Script de test automatique

```bash
cd backend
node test-documents.js
```

Ce script va :
1. ✅ Se connecter en tant que lab
2. ✅ Créer un document de test
3. ✅ Récupérer tous les documents
4. ✅ Récupérer le document par ID
5. ✅ Mettre à jour le document
6. ✅ Supprimer le document

### Option 2: Postman

1. Importez la collection : `backend/postman/SihatiHub-Documents-API.postman_collection.json`
2. Configurez les variables :
   - `baseUrl`: http://localhost:3001
   - `patientId`: Un ID de patient existant
   - `analyseId`: Un ID d'analyse existant
3. Testez les endpoints un par un

### Option 3: cURL

```bash
# 1. Login (Lab)
curl -X POST http://localhost:3001/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"lab@example.com","password":"password123"}'

# Copier le token reçu dans TOKEN ci-dessous

# 2. Upload un document
curl -X POST http://localhost:3001/documents/create \
  -H "Authorization: Bearer TOKEN" \
  -F "titre=Test Document" \
  -F "type=analyse" \
  -F "patient=507f1f77bcf86cd799439011" \
  -F "description=Document de test" \
  -F "file=@./test.pdf"

# 3. Récupérer tous les documents
curl -X GET http://localhost:3001/documents \
  -H "Authorization: Bearer TOKEN"
```

## 🔍 Vérification MinIO

1. Ouvrez la console MinIO: http://localhost:9001
2. Connectez-vous avec :
   - Username: `admin`
   - Password: `password`
3. Vérifiez les buckets créés :
   - `sihati-documents`
   - `sihati-lab-reports`
   - `sihati-ordonnances`
4. Explorez les fichiers uploadés

## 📝 Exemple de workflow complet

### Scénario : Lab uploade un résultat d'analyse

```javascript
// 1. Le médecin crée une consultation avec une analyse
POST /consultation/create
{
  "patient": "PATIENT_ID",
  "doctor": "DOCTOR_ID",
  ...
}

// 2. Le médecin ajoute une analyse à la consultation
POST /analyses/consultation/CONSULTATION_ID
{
  "lab": "LAB_ID",
  "description": "Analyse sanguine complète"
}

// 3. Le lab reçoit la demande et effectue l'analyse
GET /analyses/lab
// Le lab voit toutes ses analyses en attente

// 4. Le lab remplit le résultat
PATCH /analyses/ANALYSE_ID/confirmer
{
  "status": "délivrée",
  "resultat": "Résultats normaux..."
}

// 5. 🆕 Le lab uploade le document PDF avec les résultats détaillés
POST /documents/create
{
  "titre": "Résultat analyse sanguine",
  "type": "analyse",
  "patient": "PATIENT_ID",
  "analyse": "ANALYSE_ID",
  "description": "Résultats complets de l'analyse",
  "file": resultat.pdf
}

// 6. Le patient peut récupérer ses documents
GET /documents/user/PATIENT_ID?type=analyse
```

## 🛠️ Dépannage

### Problème : "Failed to upload file"

**Solution :**
1. Vérifiez que MinIO est en cours d'exécution : `docker ps | grep minio`
2. Vérifiez les logs MinIO : `docker logs sihatiHub-minio-1`
3. Testez la connexion MinIO depuis la console : http://localhost:9001

### Problème : "Type de fichier non autorisé"

**Solution :**
Vérifiez les types MIME autorisés dans `.env.docker` :
```env
ALLOWED_DOCUMENT_TYPES=application/pdf,image/jpeg,image/png,image/jpg
```

### Problème : "Non authentifié"

**Solution :**
1. Vérifiez que le token est valide
2. Vérifiez le format : `Authorization: Bearer YOUR_TOKEN`
3. Reconnectez-vous pour obtenir un nouveau token

### Problème : "Document non trouvé"

**Solution :**
1. Vérifiez que l'ID du document est correct
2. Vérifiez que le document n'a pas été supprimé
3. Testez avec `GET /documents` pour lister tous les documents

## 📊 Structure de données

### Exemple de réponse après création

```json
{
  "success": true,
  "message": "Document créé avec succès",
  "data": {
    "_id": "6751234567890abcdef12345",
    "titre": "Analyse sanguine complète",
    "type": "analyse",
    "fileName": "1730899200000_uuid-here.pdf",
    "originalName": "resultats.pdf",
    "fileUrl": "http://localhost:9100/sihati-lab-reports/1730899200000_uuid-here.pdf?X-Amz-Algorithm=...",
    "bucketName": "sihati-lab-reports",
    "mimetype": "application/pdf",
    "fileSize": 102400,
    "patient": {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "uploadedBy": {
      "_id": "...",
      "firstName": "Lab",
      "lastName": "Central",
      "role": "lab"
    },
    "analyse": {
      "_id": "...",
      "description": "Analyse sanguine",
      "status": "délivrée"
    },
    "description": "Résultats d'analyse",
    "tags": ["sanguin", "complet"],
    "isPublic": false,
    "createdAt": "2025-11-06T10:00:00.000Z",
    "updatedAt": "2025-11-06T10:00:00.000Z"
  }
}
```

## 🔐 Permissions

| Endpoint | Patient | Médecin | Lab | Admin |
|----------|---------|---------|-----|-------|
| POST /documents/create | ❌ | ✅ | ✅ | ✅ |
| GET /documents | ✅ | ✅ | ✅ | ✅ |
| GET /documents/:id | ✅ | ✅ | ✅ | ✅ |
| GET /documents/user/:userId | ✅ | ✅ | ✅ | ✅ |
| PATCH /documents/:id | ❌ | ✅* | ✅* | ✅ |
| DELETE /documents/:id | ❌ | ✅* | ✅* | ✅ |

*Seulement pour leurs propres documents

## 📚 Documentation complète

Pour plus de détails, consultez : `backend/DOCUMENTS_API.md`

## 🎯 Prochaines étapes

1. ✅ Testez l'API avec Postman ou le script de test
2. ✅ Vérifiez que les fichiers sont bien uploadés dans MinIO
3. ✅ Intégrez avec votre frontend
4. ✅ Ajoutez des notifications lors de l'upload de documents
5. ✅ Implémentez la prévisualisation de documents PDF

---

**Bonne chance avec vos tests ! 🚀**
