# SihatiHub

**SihatiHub – Full-stack EHR application (Node.js, Express, MongoDB, React) for managing users, patients, and appointments.**

## 🚀 Overview

SihatiHub is a prototype EHR platform for clinics and medical offices, providing a secure backend with REST API and a modern frontend interface. The MVP focuses on authentication, user management, patient records, and appointment scheduling with conflict prevention.

## ✨ Key Features

* Secure authentication (JWT, refresh tokens, password reset)
* User roles and profiles (admin, doctor, nurse, secretary, patient)
* Patient records management (allergies, history, contacts, insurance, consent)
* Appointment CRUD with conflict checking and reminders
* Practitioner availability endpoints
* Email notifications via queue (Redis)
* Input validation and centralized error handling
* Unit & integration tests (Mocha, Chai, Supertest)

## 🧩 Tech Stack

* Node.js, Express.js
* MongoDB (Mongoose)
* React (frontend)
* JWT + bcrypt for auth
* Redis for task queue
* Nodemailer for emails
* Winston + Morgan for logging

## 📦 API Endpoints (summary)

* `POST /api/v1/auth/register` / `login` / `refresh` / `logout` / `forgot-password` / `reset-password`
* Users CRUD: `/api/v1/users` (admin only)
* Patients CRUD: `/api/v1/patients`
* Appointments CRUD: `/api/v1/appointments`, availability `/api/v1/practitioners/:id/availability`

## 🧪 Testing

* Unit tests (Mocha/Chai)
* Integration tests (Supertest + mongodb-memory-server)
* **Postman Collection** - Collection complète avec 29 endpoints pour tests manuels

## 📮 Postman Collection

Une collection Postman complète est disponible pour tester toutes les fonctionnalités de l'API :

### 📁 Fichiers disponibles
- `SihatiHub_Postman_Collection.json` - Collection avec 29 requêtes
- `SihatiHub_Environment.postman_environment.json` - Variables d'environnement
- `POSTMAN_README.md` - Guide rapide
- `POSTMAN_GUIDE.md` - Guide d'utilisation complet
- `POSTMAN_TEST_SCENARIOS.md` - Scénarios de test et cas limites
- `API_RESPONSE_EXAMPLES.md` - Exemples de réponses

### 🚀 Quick Start

**Windows PowerShell:**
```powershell
.\import-postman.ps1
```

**Import manuel:**
1. Ouvrez Postman
2. Cliquez sur **Import**
3. Sélectionnez `SihatiHub_Postman_Collection.json` et `SihatiHub_Environment.postman_environment.json`
4. Activez l'environnement "SihatiHub Environment"

### 📋 Endpoints inclus (29 total)
- **Authentication** (9) - Register/Login pour tous les rôles
- **Rendez-vous** (9) - Gestion complète des appointments
- **Consultations** (5) - Création et suivi
- **Ordonnances** (3) - Prescriptions et délivrance
- **Analyses** (3) - Tests de laboratoire

### 📖 Documentation complète
Consultez `POSTMAN_GUIDE.md` pour l'utilisation détaillée et `POSTMAN_TEST_SCENARIOS.md` pour les scénarios de test complets.