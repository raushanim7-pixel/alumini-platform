# Apex Alumni OS — Centralised Alumni Data & Engagement Platform

A production-ready, interactive web platform implementing a comprehensive centralized alumni management and data governance ecosystem for **Apex Institute of Science & Technology** (supporting 50,000+ alumni).

---

## 🚀 Quick Start & Live Access

The backend server is already running live locally on port `8000`:

* **Web Application URL:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
* **RESTful API Documentation (Swagger/OpenAPI):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **Health Endpoint:** [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

To start or restart the server manually at any time:
```powershell
cd C:\Users\HP\.gemini\antigravity\scratch\alumni-platform
python -m uvicorn server:app --host 127.0.0.1 --port 8000 --reload
```

---

## 👥 Interactive Role Switcher

Use the **"Viewing as"** dropdown in the top header to instantly test the platform from different stakeholder perspectives:

| Persona | Name & Context | Key Capabilities & Views |
| :--- | :--- | :--- |
| **Alumnus** | Vikramaditya Mehta (Google Cloud, Class of '18) | Digital ID Card, Mentor availability, Directory InMail, 80G Giving, Event RSVP |
| **Current Student** | Arjun Rathore (3rd Year UG, CSE) | Mentor requests, Alumni referral job board applications |
| **Alumni Office Admin** | Dr. R. K. Sharma (Director, Alumni Affairs) | Full database access, claim approvals, donation tracking, communications |
| **Dept Coordinator** | Prof. Meenakshi Sundaram (CSE) | Departmental batch rosters, alumni achievements, mentorship tracking |
| **Super Admin** | CIO & Systems Registrar | Data Governance, Levenshtein duplicate reconciliation, DPDP 2023 audit logs |

---

## 🛠️ 11 Core Modules Implemented

1. **Alumni Registration & Verification:**
   * Instant ERP / SIS pre-seeded lookup using Roll Number (`16BCS099` or `14BCS042`), passing year, and department.
   * OTP verification simulation (enter code `123456`) with instant verified alumni badge.
   * Method B: Manual degree certificate upload pipeline.
2. **Centralised Profile Database & Digital ID:**
   * Dynamic **Digital Alumni Lifetime Pass** with signed QR code for campus security gate access.
   * Profile Completeness Index (PCI) health gauge.
3. **Search & Directory:**
   * Multi-attribute faceted filtering (Department, Batch, City, Skills, "Open to Mentor", "Hiring").
   * Contact details masked according to DPDP Act 2023 privacy consent rules.
   * Direct InMail messaging proxy.
4. **Communication Hub:**
   * Multi-channel campaign broadcast simulator (Email, WhatsApp Business Cloud API, SMS).
5. **Events & Reunions:**
   * Event catalog (Silver Jubilee 2001 Reunion, Bay Area Chapter Meetup, AI Webinars).
   * Interactive RSVP & Ticketing with dynamic QR code generation.
6. **Mentorship & Career Network:**
   * Mentor profile discovery and structured 1-on-1 session request modal.
   * Exclusive Alumni Referral Job Board with one-click profile application.
7. **Giving & Section 80G Tax Exemption:**
   * Campaign tracking (AI Computing Lab, Rural Girls Fellowship, Student Emergency Fund).
   * Simulated Razorpay/UPI checkout with mandatory PAN collection.
   * **Instant Official Section 80G Tax Exemption Certificate** with verification QR code and print/PDF layout.
8. **News & Spotlights:**
   * Community editorial showcase featuring venture funding, civil service honors, and campus gifts.
9. **Surveys & Feedback:**
   * Structured data capture aligned with **NIRF Criteria 5** and **NAAC Metric 5.2.2** requirements.
10. **Executive Analytics Dashboard:**
    * Interactive Chart.js visualisations: Domestic vs. International Geographic dispersion, Sector distribution, and 5-Year Giving progression.
11. **Data Governance & DPDP Act 2023 Compliance:**
    * Side-by-side duplicate profile merge resolution (Levenshtein match score > 90%).
    * Pending manual document verification approval queue.
    * Immutable audit trail logging PII access, consent changes, and data erasure requests.

---

## 📂 Project Architecture

```
alumni-platform/
├── server.py              # FastAPI backend with RESTful API endpoints & seed data
├── README.md              # Project documentation
└── static/
    ├── index.html         # Responsive Tailwind single-page application
    ├── app.js             # Client state management, API calls, QR generation
    └── styles.css         # Custom academic theme styling & print CSS
```
