# Guide d'utilisation - Collection Postman SihatiHub

## 📋 Vue d'ensemble

Cette collection Postman complète permet de tester toutes les fonctionnalités de l'API SihatiHub, incluant :
- **Authentication** : Inscription et connexion des utilisateurs
- **Appointments** : Gestion des rendez-vous médicaux
- **Consultations** : Création et gestion des consultations
- **Analyses** : Prescription et suivi des analyses médicales
- **Ordonnances** : Gestion des prescriptions médicamenteuses
- **Documents** : Upload et gestion des documents médicaux

## 🚀 Installation

### 1. Importer la collection dans Postman

1. Ouvrez Postman
2. Cliquez sur **Import** (en haut à gauche)
3. Sélectionnez le fichier `SihatiHub-Complete-API.postman_collection.json`
4. Cliquez sur **Import**

### 2. Importer l'environnement

1. Cliquez sur **Import**
2. Sélectionnez le fichier `SihatiHub.postman_environment.json`
3. Cliquez sur **Import**
4. Sélectionnez l'environnement **SihatiHub Environment** dans le menu déroulant en haut à droite

## 🔧 Configuration

### Variables d'environnement

L'environnement contient les variables suivantes :

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `baseUrl` | URL de base de l'API | `http://localhost:3000` |
| `patientToken` | Token JWT du patient | Auto-généré lors du login |
| `doctorToken` | Token JWT du médecin | Auto-généré lors du login |
| `labToken` | Token JWT du laboratoire | Auto-généré lors du login |
| `pharmacienToken` | Token JWT du pharmacien | Auto-généré lors du login |
| `adminToken` | Token JWT de l'admin | Auto-généré lors du login |
| `patientId` | ID du patient | Auto-généré |
| `doctorId` | ID du médecin | Auto-généré |
| `appointmentId` | ID du rendez-vous | Auto-généré |
| `consultationId` | ID de la consultation | Auto-généré |
| `analyseId` | ID de l'analyse | Auto-généré |
| `ordonnanceId` | ID de l'ordonnance | Auto-généré |
| `documentId` | ID du document | Auto-généré |

**Note :** Les tokens et IDs sont automatiquement enregistrés dans l'environnement grâce aux scripts de test.

## 📝 Ordre de test recommandé

Pour tester le flux complet de l'application, suivez cet ordre :

### Phase 1 : Configuration initiale

1. **Login Admin** - Se connecter en tant qu'administrateur
2. **Create Staff** - Créer les comptes du personnel (médecin, lab, pharmacien)

### Phase 2 : Inscription et connexion des utilisateurs

3. **Register Patient** - Créer un compte patient
4. **Login Patient** - Se connecter en tant que patient
5. **Login Doctor** - Se connecter en tant que médecin
6. **Login Lab** - Se connecter en tant que laboratoire
7. **Login Pharmacien** - Se connecter en tant que pharmacien

### Phase 3 : Gestion des rendez-vous

8. **Définir Horaires** (Médecin) - Le médecin définit ses disponibilités
9. **Obtenir Horaires** - Consulter les horaires du médecin
10. **Voir Créneaux Disponibles** (Patient) - Voir les créneaux disponibles
11. **Peut Réserver** (Patient) - Vérifier si le patient peut réserver
12. **Réserver Rendez-vous** (Patient) - Réserver un créneau
13. **Mes Rendez-vous** (Patient/Doctor) - Voir ses rendez-vous
14. **Confirmer Rendez-vous** (Médecin) - Confirmer le rendez-vous

### Phase 4 : Consultation médicale

15. **Créer Consultation** (Médecin) - Créer une consultation après le RDV
16. **Get Consultation By ID** - Consulter les détails
17. **Update Consultation** - Mettre à jour si nécessaire

### Phase 5 : Prescription d'analyses

18. **Ajouter Analyse à Consultation** (Médecin) - Prescrire une analyse
19. **Get Analyses Lab** (Lab) - Le labo voit ses analyses
20. **Confirmer Statut Analyse** (Lab) - Le labo ajoute les résultats

### Phase 6 : Gestion des documents

21. **Create Document** (Lab) - Upload du résultat d'analyse
22. **Get Documents By User** (Patient) - Le patient consulte ses documents
23. **Get Documents By Analyse** - Voir les documents d'une analyse
24. **Update Document** - Modifier un document si nécessaire

### Phase 7 : Prescription médicamenteuse

25. **Ajouter Ordonnance** (Médecin) - Prescrire des médicaments
26. **Get Ordonnances Pharmacien** (Pharmacien) - Voir les ordonnances
27. **Confirmer Statut Ordonnance** (Pharmacien) - Marquer comme délivrée

### Phase 8 : Dossier médical

28. **Get Medical Record By Patient** - Consulter le dossier complet

## 🔐 Authentification

### Comptes par défaut

Après avoir exécuté le seeder admin, utilisez ces identifiants :

**Admin :**
```json
{
  "email": "admin@sihati.com",
  "password": "Admin123!"
}
```

Les autres comptes (médecin, lab, pharmacien) doivent être créés via la requête **Create Staff** par l'admin.

### Utilisation des tokens

Les tokens sont automatiquement :
- Extraits de la réponse de login
- Stockés dans les variables d'environnement
- Utilisés dans les headers `Authorization: Bearer {{token}}`

## 📂 Structure de la collection

### 1. Authentication (8 requêtes)
- Inscription patient
- Connexion (patient, médecin, lab, pharmacien, admin)
- Création de personnel (admin uniquement)

### 2. Appointments (9 requêtes)
- Gestion des horaires
- Consultation des disponibilités
- Réservation et confirmation
- Annulation de rendez-vous

### 3. Consultations (5 requêtes)
- Création et mise à jour de consultations
- Consultation du dossier médical

### 4. Analyses (3 requêtes)
- Prescription d'analyses
- Gestion par le laboratoire
- Confirmation des résultats

### 5. Ordonnances (3 requêtes)
- Prescription de médicaments
- Gestion par le pharmacien
- Confirmation de délivrance

### 6. Documents (7 requêtes)
- Upload de documents
- Consultation par patient/analyse
- Mise à jour et suppression

## 🧪 Tests automatiques

Chaque requête importante inclut des scripts de test qui :
- Vérifient le code de statut HTTP
- Extraient les IDs et tokens de la réponse
- Les stockent automatiquement dans l'environnement

### Exemple de script de test :

```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set('consultationId', jsonData._id);
    pm.test('Consultation created successfully', function () {
        pm.response.to.have.status(201);
    });
}
```

## 📊 Flux de données

```
Patient → Rendez-vous → Consultation → Analyses/Ordonnances → Documents
   ↓           ↓             ↓               ↓                    ↓
Inscription  Médecin     Médecin       Lab/Pharmacien        Lab/Médecin
```

## 🎯 Cas d'usage complets

### Cas 1 : Consultation complète avec analyse

1. Patient s'inscrit et se connecte
2. Médecin définit ses horaires
3. Patient réserve un rendez-vous
4. Médecin confirme le rendez-vous
5. Médecin crée une consultation
6. Médecin prescrit une analyse
7. Laboratoire confirme et ajoute les résultats
8. Laboratoire upload le document PDF des résultats
9. Patient consulte son dossier médical

### Cas 2 : Consultation avec ordonnance

1. Médecin crée une consultation
2. Médecin ajoute une ordonnance
3. Pharmacien consulte ses ordonnances
4. Pharmacien confirme la délivrance

## 🔍 Recherche et filtrage

Certaines requêtes supportent des paramètres de recherche :

**Mes Rendez-vous :**
```
GET /rendez-vous/mes-rendez-vous?role=patient
GET /rendez-vous/mes-rendez-vous?role=medecin
```

**Créneaux disponibles :**
```
GET /rendez-vous/disponibles?doctorId={{doctorId}}&date=2025-11-10
```

## 📤 Upload de fichiers

Pour les requêtes de création/mise à jour de documents :

1. Sélectionnez l'onglet **Body**
2. Choisissez **form-data**
3. Pour le champ `file`, sélectionnez **File** dans le menu déroulant
4. Cliquez sur **Select Files** et choisissez votre fichier
5. Ajoutez les autres champs (nom, type, description, etc.)

## ⚠️ Gestion des erreurs

La collection gère automatiquement :
- ✅ Codes 200/201 : Succès
- ⚠️ Code 400 : Erreur de validation
- 🔒 Code 401 : Non authentifié
- 🚫 Code 403 : Non autorisé
- ❌ Code 404 : Ressource non trouvée
- 💥 Code 500 : Erreur serveur

## 🛠️ Dépannage

### Problème : Token expiré
**Solution :** Relancez la requête de login correspondante

### Problème : Variables non définies
**Solution :** Assurez-vous d'avoir exécuté les requêtes dans l'ordre recommandé

### Problème : Fichier non uploadé
**Solution :** Vérifiez que MinIO est démarré avec `docker-compose up -d`

### Problème : Accès refusé
**Solution :** Vérifiez que vous utilisez le bon token pour le rôle requis

## 📚 Ressources supplémentaires

- [Documentation API complète](./DOCUMENTS_API.md)
- [Guide de démarrage rapide](./QUICKSTART_DOCUMENTS.md)
- [Collection Documents uniquement](./SihatiHub-Documents-API.postman_collection.json)

## 🎓 Bonnes pratiques

1. **Toujours vérifier l'environnement actif** avant d'exécuter les requêtes
2. **Exécuter les requêtes dans l'ordre** pour la première fois
3. **Consulter les tests** pour comprendre les valeurs extraites
4. **Utiliser les variables** plutôt que des valeurs en dur
5. **Vérifier les logs** du serveur en cas d'erreur

## 📝 Notes importantes

- Les tokens JWT expirent après un certain temps
- Les IDs sont générés automatiquement par MongoDB
- Les fichiers uploadés sont stockés dans MinIO
- Certaines routes nécessitent des rôles spécifiques

## 🤝 Contribution

Pour ajouter de nouvelles requêtes à la collection :
1. Créez la requête dans Postman
2. Ajoutez les scripts de test appropriés
3. Exportez la collection mise à jour
4. Documentez les changements dans ce README

---

**Version :** 1.0.0  
**Dernière mise à jour :** 6 novembre 2025  
**Auteur :** SihatiHub Team
