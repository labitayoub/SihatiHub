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