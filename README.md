# StressSense

### Adaptive Multimodal Student Stress Assessment & Profiling System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-StressSense-0f766e?style=for-the-badge)](https://stresssense-nine.vercel.app)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square)](https://fastapi.tiangolo.com/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square)](https://www.postgresql.org/)
[![Authentication](https://img.shields.io/badge/Auth-Firebase-FFCA28?style=flat-square)](https://firebase.google.com/)
[![AI](https://img.shields.io/badge/AI-OpenCV%20%2B%20ONNX-5C3EE8?style=flat-square)](https://opencv.org/)

StressSense is an AI-assisted student stress screening and profiling application designed to help students understand indicators of their current stress levels.

The system combines an **adaptive questionnaire** with optional **facial-expression analysis** to generate a personalized stress profile, confidence information, dimension-level insights, and practical recommendations.

> **Important:** StressSense is an awareness and educational screening tool. It is **not a medical or psychological diagnostic system** and should not be used as a substitute for professional evaluation.

---

## 🚀 Live Demo

### 🌐 Application
**https://stresssense-nine.vercel.app**

### ⚙️ Backend API
**https://stresssense-api.onrender.com**

---

## ✨ Key Features

### 🧠 Adaptive 30-Question Assessment

StressSense contains a question bank of **37 questions** and dynamically selects exactly **30 questions** for each assessment.

Question selection adapts according to previous responses to improve relevance and coverage across stress dimensions.

Questions are distributed across:

- Academic Pressure
- Sleep & Rest
- Concentration
- Emotional State
- Social Pressure
- Time Management
- Physical Stress
- General Wellbeing

The system prevents repeated questions and maintains category coverage while adapting to previous answers.

---

### 📷 Optional Facial-Expression Analysis

StressSense can use the browser camera as a **supporting behavioral signal** during assessment.

The facial-expression pipeline uses:

- Browser camera / MediaDevices API
- OpenCV
- Lightweight ONNX facial-expression model
- Expression categories:
  - Happy
  - Neutral
  - Sad

The questionnaire remains the **primary signal**. Facial analysis is supplementary and is incorporated only when the captured signal has sufficient reliability.

Raw facial images or video are not permanently stored.

---

### 📊 Reliability-Aware Multimodal Fusion

StressSense combines questionnaire and facial signals using reliability-aware weighting.

The questionnaire has the primary weight, while facial information is adjusted according to its reliability.

The system also reports:

- Questionnaire score
- Facial score
- Facial reliability
- Signal agreement
- Assessment confidence

This prevents an unreliable facial signal from dominating the final assessment.

---

### 📈 Stress Profiling

The result dashboard provides:

- Overall stress percentage
- Low / Moderate / High stress level
- Stress score
- Stress dimension breakdown
- Primary stress factor
- Facial-expression distribution
- Facial reliability
- Signal agreement
- Assessment confidence
- Explanation of the result
- Personalized recommendations

---

### 💡 Personalized Recommendations

Recommendations are generated according to the user's highest-scoring stress dimensions.

The application provides practical wellness and study-oriented suggestions without presenting medical treatment or medication advice.

---

### 📚 Assessment History

Users can view previous completed assessments including:

- Assessment date
- Overall stress score
- Stress level
- Previous vs current result
- Change over time
- Trend visualization

Users can also start a **Retake Assessment** while keeping previous assessment records.

---

### 🔐 Authentication

Production authentication uses:

**Firebase Authentication**

The system supports:

- Account registration
- Login
- Logout
- Protected application routes
- Persistent authenticated sessions

Mock authentication is retained only for explicit local development.

---

### 🌗 Responsive & Accessible UI

StressSense is designed for:

- Desktop
- Laptop
- Tablet
- Mobile

The interface includes:

- Light mode
- Dark mode
- Responsive layouts
- Keyboard-friendly controls
- Accessible labels
- Clear visual hierarchy
- Non-color-only status indicators

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────────┐
                    │        User             │
                    │  Browser / Smartphone   │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │        Vercel            │
                    │   React + Vite Frontend │
                    └────────────┬────────────┘
                                 │ HTTPS API
                                 ▼
                    ┌─────────────────────────┐
                    │         Render           │
                    │   FastAPI Backend        │
                    └──────┬────────┬─────────┘
                           │        │
             ┌─────────────┘        └──────────────┐
             ▼                                     ▼
   ┌───────────────────┐                 ┌───────────────────┐
   │    PostgreSQL     │                 │ Firebase Auth     │
   │ Users / Results   │                 │ Authentication    │
   │ Questions / Logs  │                 └───────────────────┘
   └───────────────────┘
             │
             ▼
   ┌────────────────────────────┐
   │ OpenCV + ONNX Facial AI   │
   │ Happy / Neutral / Sad      │
   └────────────────────────────┘
