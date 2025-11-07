# 📚 SihatiHub - Documentation Postman

## 📦 Collections disponibles

### 1. Collection Complète (RECOMMANDÉ)
**Fichier:** `SihatiHub-Complete-API.postman_collection.json`

Collection complète avec **35+ requêtes** couvrant toutes les fonctionnalités de SihatiHub :
- ✅ Authentication (8 requêtes)
- ✅ Appointments (9 requêtes)
- ✅ Consultations (5 requêtes)
- ✅ Analyses (3 requêtes)
- ✅ Ordonnances (3 requêtes)
- ✅ Documents (7 requêtes)

**Tests automatiques inclus** avec extraction automatique des tokens et IDs.

### 2. Collection Documents (Spécialisée)
**Fichier:** `SihatiHub-Documents-API.postman_collection.json`

Collection dédiée à la gestion des documents médicaux avec MinIO.

## 🌍 Environnement

**Fichier:** `SihatiHub.postman_environment.json`

Variables d'environnement pré-configurées :
- `baseUrl` - URL de l'API (http://localhost:3000)
- Tokens d'authentification (auto-générés)
- IDs des ressources (auto-générés)

## 📖 Documentation

### Guide principal
**Fichier:** `README-POSTMAN.md`

Guide complet d'utilisation incluant :
- 📦 Installation et configuration
- 🔐 Authentification et gestion des tokens
- 📝 Ordre de test recommandé
- 🎯 Cas d'usage complets
- 🔍 Recherche et filtrage
- ⚠️ Gestion des erreurs
- 🛠️ Dépannage

### Tests automatisés Newman
**Fichier:** `NEWMAN-TESTS.md`

Guide pour les tests automatisés CLI :
- Installation de Newman
- Commandes d'exécution
- Génération de rapports HTML
- Intégration CI/CD (GitHub Actions)
- Scripts package.json

### Scripts de test rapide

#### PowerShell (Windows)
**Fichier:** `quick-test.ps1`

```powershell
.\quick-test.ps1
```

Tests rapides :
- ✅ Health check de l'API
- ✅ Inscription patient
- ✅ Connexion patient/admin
- ✅ Routes protégées
- ✅ Sécurité

#### Bash (Linux/Mac)
**Fichier:** `quick-test.sh`

```bash
chmod +x quick-test.sh
./quick-test.sh
```

## 🚀 Démarrage rapide

### Option 1 : Import manuel dans Postman

1. **Ouvrir Postman**
2. **Import** → Sélectionner les fichiers :
   - `SihatiHub-Complete-API.postman_collection.json`
   - `SihatiHub.postman_environment.json`
3. **Activer l'environnement** "SihatiHub Environment"
4. **Commencer les tests** dans l'ordre recommandé

### Option 2 : Tests automatisés avec Newman

```bash
# Installer Newman
npm install -g newman newman-reporter-html

# Exécuter tous les tests
newman run SihatiHub-Complete-API.postman_collection.json \
  -e SihatiHub.postman_environment.json \
  -r html \
  --reporter-html-export ./reports/test-report.html
```

### Option 3 : Test rapide

**Windows:**
```powershell
.\quick-test.ps1
```

**Linux/Mac:**
```bash
./quick-test.sh
```

## 📊 Structure de la collection complète

```
SihatiHub Complete API
│
├── 🔐 Authentication
│   ├── Register Patient
│   ├── Login Patient
│   ├── Login Doctor
│   ├── Login Lab
│   ├── Login Pharmacien
│   ├── Login Admin
│   └── Create Staff (Admin)
│
├── 📅 Appointments
│   ├── Définir Horaires (Doctor)
│   ├── Obtenir Horaires
│   ├── Voir Créneaux Disponibles
│   ├── Peut Réserver
│   ├── Réserver Rendez-vous
│   ├── Mes Rendez-vous (Patient)
│   ├── Mes Rendez-vous (Doctor)
│   ├── Confirmer Rendez-vous
│   └── Annuler Rendez-vous
│
├── 🩺 Consultations
│   ├── Créer Consultation
│   ├── Get All Consultations
│   ├── Get Consultation By ID
│   ├── Update Consultation
│   └── Get Medical Record By Patient
│
├── 🔬 Analyses
│   ├── Ajouter Analyse à Consultation
│   ├── Get Analyses Lab
│   └── Confirmer Statut Analyse
│
├── 💊 Ordonnances
│   ├── Ajouter Ordonnance
│   ├── Get Ordonnances Pharmacien
│   └── Confirmer Statut Ordonnance
│
└── 📄 Documents
    ├── Create Document
    ├── Get All Documents
    ├── Get Document By ID
    ├── Get Documents By User
    ├── Get Documents By Analyse
    ├── Update Document
    └── Delete Document
```

## 🎯 Workflows recommandés

### Workflow 1 : Consultation complète
```
1. Login Patient → Login Doctor
2. Définir Horaires (Doctor)
3. Réserver Rendez-vous (Patient)
4. Confirmer Rendez-vous (Doctor)
5. Créer Consultation (Doctor)
6. Ajouter Analyse (Doctor)
7. Confirmer Analyse (Lab)
8. Upload Document (Lab)
9. Consulter Dossier Médical (Patient)
```

### Workflow 2 : Prescription médicamenteuse
```
1. Créer Consultation (Doctor)
2. Ajouter Ordonnance (Doctor)
3. Voir Ordonnances (Pharmacien)
4. Confirmer Délivrance (Pharmacien)
```

### Workflow 3 : Gestion documentaire
```
1. Create Document (Lab/Doctor)
2. Get Documents By User (Patient)
3. Get Documents By Analyse (Lab)
4. Update Document (Lab/Doctor)
```

## 🔑 Variables d'environnement

| Variable | Type | Description |
|----------|------|-------------|
| `baseUrl` | String | URL de base de l'API |
| `patientToken` | Secret | Token JWT du patient |
| `doctorToken` | Secret | Token JWT du médecin |
| `labToken` | Secret | Token JWT du labo |
| `pharmacienToken` | Secret | Token JWT du pharmacien |
| `adminToken` | Secret | Token JWT de l'admin |
| `patientId` | String | ID du patient |
| `doctorId` | String | ID du médecin |
| `appointmentId` | String | ID du rendez-vous |
| `consultationId` | String | ID de la consultation |
| `analyseId` | String | ID de l'analyse |
| `ordonnanceId` | String | ID de l'ordonnance |
| `documentId` | String | ID du document |

**Note:** Toutes les variables (sauf baseUrl) sont auto-générées par les scripts de test.

## 📝 Comptes de test par défaut

### Admin
```json
{
  "email": "admin@sihati.com",
  "password": "Admin123!"
}
```

### Patient de test
```json
{
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```

**Note:** Les autres comptes (médecin, lab, pharmacien) doivent être créés via la route "Create Staff" par l'admin.

## 🧪 Tests inclus

Chaque requête importante contient des scripts de test qui :
- ✅ Vérifient le code de statut HTTP
- ✅ Valident la structure de la réponse
- ✅ Extraient automatiquement les tokens et IDs
- ✅ Les stockent dans l'environnement pour réutilisation

### Exemple de test automatique
```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set('consultationId', jsonData._id);
    pm.test('Consultation created successfully', function () {
        pm.response.to.have.status(201);
    });
}
```

## 📈 Rapports de test

Générez des rapports HTML détaillés avec Newman :

```bash
newman run SihatiHub-Complete-API.postman_collection.json \
  -e SihatiHub.postman_environment.json \
  -r html,cli \
  --reporter-html-export ./reports/test-report-$(date +%Y%m%d-%H%M%S).html
```

## 🔧 Dépannage

### ❌ Erreur: Token expiré
**Solution:** Relancez la requête de login correspondante

### ❌ Erreur: Variable non définie
**Solution:** Exécutez les requêtes dans l'ordre recommandé (section Workflows)

### ❌ Erreur: Cannot connect to API
**Solution:** Vérifiez que le serveur backend est démarré:
```bash
cd backend
npm start
```

### ❌ Erreur: Upload de fichier échoue
**Solution:** Vérifiez que MinIO est en cours d'exécution:
```bash
docker-compose up -d
```

## 🤝 Contribution

Pour ajouter de nouvelles requêtes :
1. Créez la requête dans Postman
2. Ajoutez les scripts de test appropriés
3. Testez avec différents scénarios
4. Exportez et partagez

## 📞 Support

- **Documentation API:** `DOCUMENTS_API.md`
- **Quickstart:** `QUICKSTART_DOCUMENTS.md`
- **Guide Postman:** `README-POSTMAN.md`
- **Tests Newman:** `NEWMAN-TESTS.md`

## 📅 Changelog

### Version 1.0.0 (6 novembre 2025)
- ✨ Collection complète avec 35+ requêtes
- ✨ Tests automatiques intégrés
- ✨ Documentation complète
- ✨ Scripts de test rapide (PS1/Bash)
- ✨ Support Newman pour CI/CD
- ✨ Environnement pré-configuré

---

**Développé par:** SihatiHub Team  
**Dernière mise à jour:** 6 novembre 2025  
**Version:** 1.0.0
