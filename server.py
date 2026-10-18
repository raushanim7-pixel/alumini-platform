import os
import uuid
import random
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query, Body, status
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

app = FastAPI(
    title="Apex Institute Alumni Management & Data Platform",
    description="Centralized Alumni Management OS supporting 50,000+ Alumni",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# IN-MEMORY REPOSITORY WITH REALISTIC SEED DATA
# -------------------------------------------------------------

# Pre-seeded master roster for ERP verification
ERP_ROSTER = [
    {
        "enrolment_no": "14BCS042",
        "name": "Vikramaditya Mehta",
        "passing_year": 2018,
        "department": "Computer Science & Engineering",
        "degree": "B.Tech",
        "email": "vikram.mehta@example.com",
        "phone": "+91 98765 43210",
        "claimed": True,
        "profile_id": "alm-001"
    },
    {
        "enrolment_no": "18BEC015",
        "name": "Dr. Sunita Ramanathan",
        "passing_year": 2022,
        "department": "Electronics & Communication",
        "degree": "B.Tech",
        "email": "sunita.ram@example.com",
        "phone": "+91 98765 11223",
        "claimed": True,
        "profile_id": "alm-002"
    },
    {
        "enrolment_no": "10BME088",
        "name": "Rajesh Kannan",
        "passing_year": 2014,
        "department": "Mechanical Engineering",
        "degree": "B.Tech",
        "email": "rajesh.k@example.com",
        "phone": "+91 98220 54321",
        "claimed": True,
        "profile_id": "alm-003"
    },
    {
        "enrolment_no": "20MBA009",
        "name": "Ananya Deshmukh",
        "passing_year": 2022,
        "department": "School of Management",
        "degree": "MBA",
        "email": "ananya.d@example.com",
        "phone": "+91 97110 99887",
        "claimed": True,
        "profile_id": "alm-004"
    },
    # Unclaimed record for testing registration
    {
        "enrolment_no": "16BCS099",
        "name": "Aditya Vardhan",
        "passing_year": 2020,
        "department": "Computer Science & Engineering",
        "degree": "B.Tech",
        "email": "aditya.v@example.com",
        "phone": "+91 98100 12345",
        "claimed": False,
        "profile_id": None
    },
    {
        "enrolment_no": "19BCE031",
        "name": "Meera Swaminathan",
        "passing_year": 2023,
        "department": "Civil Engineering",
        "degree": "B.Tech",
        "email": "meera.s@example.com",
        "phone": "+91 99200 45678",
        "claimed": False,
        "profile_id": None
    }
]

# Master Alumni Profiles (Golden Records)
ALUMNI_PROFILES = [
    {
        "id": "alm-001",
        "name": "Vikramaditya Mehta",
        "enrolment_no": "14BCS042",
        "graduation_year": 2018,
        "department": "Computer Science & Engineering",
        "degree": "B.Tech",
        "campus": "Main Campus",
        "company": "Google Cloud",
        "designation": "Staff Software Engineer",
        "industry": "Cloud & Distributed Systems",
        "city": "Bengaluru",
        "country": "India",
        "skills": ["Distributed Systems", "Kubernetes", "Golang", "System Design"],
        "bio": "Building hyper-scale infrastructure at Google Cloud. Passionate about mentoring students in distributed systems and competitive programming.",
        "willing_to_mentor": True,
        "willing_to_hire": True,
        "willing_to_speak": True,
        "profile_completeness": 95,
        "email": "vikram.mehta@example.com",
        "phone": "+91 98765 43210",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        "privacy": {
            "email": "BATCH_ONLY",
            "phone": "ADMIN_ONLY",
            "company": "PUBLIC_VERIFIED"
        }
    },
    {
        "id": "alm-002",
        "name": "Dr. Sunita Ramanathan",
        "enrolment_no": "18BEC015",
        "graduation_year": 2022,
        "department": "Electronics & Communication",
        "degree": "B.Tech",
        "campus": "Main Campus",
        "company": "Apple",
        "designation": "Hardware Systems Architect",
        "industry": "Semiconductors & Silicon",
        "city": "Cupertino, CA",
        "country": "United States",
        "skills": ["ASIC Design", "VLSI", "RISC-V", "Signal Integrity"],
        "bio": "Silicon architecture research at Apple. Former Stanford postdoc. Alumna of Batch 2018-2022.",
        "willing_to_mentor": True,
        "willing_to_hire": True,
        "willing_to_speak": True,
        "profile_completeness": 90,
        "email": "sunita.ram@example.com",
        "phone": "+1 (408) 555-0192",
        "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        "privacy": {
            "email": "PUBLIC_VERIFIED",
            "phone": "ADMIN_ONLY",
            "company": "PUBLIC_VERIFIED"
        }
    },
    {
        "id": "alm-003",
        "name": "Rajesh Kannan",
        "enrolment_no": "10BME088",
        "graduation_year": 2014,
        "department": "Mechanical Engineering",
        "degree": "B.Tech",
        "campus": "City Campus",
        "company": "Tata Motors EV Division",
        "designation": "Director of Battery Systems",
        "industry": "Automotive & CleanTech",
        "city": "Pune",
        "country": "India",
        "skills": ["EV Powertrain", "Thermal Management", "Product Strategy", "Six Sigma"],
        "bio": "Leading vehicle electrification initiatives at Tata Motors. Enthusiastic about clean mobility solutions.",
        "willing_to_mentor": True,
        "willing_to_hire": False,
        "willing_to_speak": True,
        "profile_completeness": 85,
        "email": "rajesh.k@example.com",
        "phone": "+91 98220 54321",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        "privacy": {
            "email": "BATCH_ONLY",
            "phone": "ADMIN_ONLY",
            "company": "PUBLIC_VERIFIED"
        }
    },
    {
        "id": "alm-004",
        "name": "Ananya Deshmukh",
        "enrolment_no": "20MBA009",
        "graduation_year": 2022,
        "department": "School of Management",
        "degree": "MBA",
        "campus": "Main Campus",
        "company": "McKinsey & Company",
        "designation": "Engagement Manager",
        "industry": "Management Consulting",
        "city": "London",
        "country": "United Kingdom",
        "skills": ["Digital Transformation", "Fintech Strategy", "M&A", "Consulting"],
        "bio": "Advising FTSE 100 banking institutions on cloud modernization and digital customer journeys.",
        "willing_to_mentor": True,
        "willing_to_hire": True,
        "willing_to_speak": False,
        "profile_completeness": 88,
        "email": "ananya.d@example.com",
        "phone": "+44 20 7946 0912",
        "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
        "privacy": {
            "email": "PUBLIC_VERIFIED",
            "phone": "ADMIN_ONLY",
            "company": "PUBLIC_VERIFIED"
        }
    },
    {
        "id": "alm-005",
        "name": "Karthik Subramanian, IAS",
        "enrolment_no": "08BEE012",
        "graduation_year": 2012,
        "department": "Electrical Engineering",
        "degree": "B.Tech",
        "campus": "Main Campus",
        "company": "Government of India",
        "designation": "District Magistrate & Collector",
        "industry": "Public Administration & Governance",
        "city": "Hyderabad",
        "country": "India",
        "skills": ["Public Policy", "Disaster Management", "E-Governance", "Leadership"],
        "bio": "Serving as civil servant in Telangana cadre. Secured All India Rank 18 in UPSC CSE 2015. Eager to guide aspirants.",
        "willing_to_mentor": True,
        "willing_to_hire": False,
        "willing_to_speak": True,
        "profile_completeness": 92,
        "email": "karthik.sub@gov.in",
        "phone": "+91 94440 88776",
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        "privacy": {
            "email": "PUBLIC_VERIFIED",
            "phone": "ADMIN_ONLY",
            "company": "PUBLIC_VERIFIED"
        }
    },
    {
        "id": "alm-006",
        "name": "Pooja Varma",
        "enrolment_no": "15BCS114",
        "graduation_year": 2019,
        "department": "Computer Science & Engineering",
        "degree": "B.Tech",
        "campus": "Main Campus",
        "company": "Synthetix AI (YC W23)",
        "designation": "Co-Founder & CTO",
        "industry": "Generative AI",
        "city": "San Francisco, CA",
        "country": "United States",
        "skills": ["LLM Fine-tuning", "Transformers", "PyTorch", "Startup Fundraising"],
        "bio": "Building enterprise reasoning agents. Raised $8M Series A. Proud alumna always looking to hire junior engineers from campus.",
        "willing_to_mentor": True,
        "willing_to_hire": True,
        "willing_to_speak": True,
        "profile_completeness": 95,
        "email": "pooja@synthetix.ai",
        "phone": "+1 (415) 555-8271",
        "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        "privacy": {
            "email": "PUBLIC_VERIFIED",
            "phone": "ADMIN_ONLY",
            "company": "PUBLIC_VERIFIED"
        }
    }
]

# Pending Verification Queue (Admin approval workflow)
PENDING_VERIFICATIONS = [
    {
        "id": "claim-101",
        "name": "Rohan Sen",
        "enrolment_no": "17BIT044",
        "department": "Information Technology",
        "graduation_year": 2021,
        "email": "rohan.sen.dev@gmail.com",
        "document_name": "degree_provisional_cert.pdf",
        "linkedin_url": "https://linkedin.com/in/rohan-sen-99",
        "submission_date": "2026-10-16",
        "status": "PENDING"
    },
    {
        "id": "claim-102",
        "name": "Tanvi Agarwal",
        "enrolment_no": "19BCH008",
        "department": "Chemical Engineering",
        "graduation_year": 2023,
        "email": "tanvi.chem@gmail.com",
        "document_name": "final_marksheet_consolidated.pdf",
        "linkedin_url": "https://linkedin.com/in/tanvi-agarwal",
        "submission_date": "2026-10-17",
        "status": "PENDING"
    }
]

# Events & Reunions
EVENTS = [
    {
        "id": "evt-001",
        "title": "Silver Jubilee Grand Alumni Reunion (Batch of 2001)",
        "type": "REUNION",
        "date": "2026-12-19 to 2026-12-21",
        "venue": "Amphitheatre & Convention Centre, Main Campus",
        "description": "Celebrating 25 glorious years of the Class of 2001. 3-day celebrations including campus walk, gala dinner, departmental interactions, and batch book launch.",
        "registered_count": 342,
        "capacity": 500,
        "ticket_price": 4500,
        "currency": "INR",
        "image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80",
        "tags": ["Jubilee", "Flagship", "Campus Homecoming"]
    },
    {
        "id": "evt-002",
        "title": "Global Tech Alumni Chapter Meetup: Bay Area",
        "type": "CHAPTER_MEETUP",
        "date": "2026-11-14 (6:00 PM PST)",
        "venue": "Palace of Fine Arts Ballroom, San Francisco, CA",
        "description": "Network with over 150 alumni executives, founders, and engineers working across Silicon Valley. Dean of Alumni Relations attending as Chief Guest.",
        "registered_count": 128,
        "capacity": 200,
        "ticket_price": 0,
        "currency": "USD",
        "image": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80",
        "tags": ["San Francisco", "Networking", "Tech Leaders"]
    },
    {
        "id": "evt-003",
        "title": "Alumni Webinar: Navigating AI & Semiconductor Disruptions",
        "type": "WEBINAR",
        "date": "2026-11-28 (7:00 PM IST)",
        "venue": "Zoom Interactive Stage",
        "description": "Panel discussion featuring Dr. Sunita Ramanathan (Apple) and Pooja Varma (Synthetix AI) on trends reshaping silicon engineering and AI software.",
        "registered_count": 510,
        "capacity": 1000,
        "ticket_price": 0,
        "currency": "INR",
        "image": "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=600&auto=format&fit=crop&q=80",
        "tags": ["Online", "Knowledge Sharing", "Careers"]
    }
]

# Registered Event Tickets
EVENT_TICKETS = [
    {
        "ticket_id": "TKT-AIST-2026-0941",
        "event_id": "evt-001",
        "user_name": "Vikramaditya Mehta",
        "enrolment_no": "14BCS042",
        "ticket_type": "Standard Alumnus Pass",
        "amount_paid": 4500,
        "qr_code": "TKT-AIST-2026-0941-VERIFIED",
        "status": "CONFIRMED"
    }
]

# Mentorship Requests
MENTORSHIP_REQUESTS = [
    {
        "id": "ment-201",
        "mentor_id": "alm-001",
        "mentor_name": "Vikramaditya Mehta",
        "student_name": "Arjun Rathore",
        "student_roll": "23BCS019",
        "student_department": "Computer Science & Engineering",
        "year": "3rd Year UG",
        "topic": "Distributed Systems & Preparing for Google Cloud Interviews",
        "message": "Sir, I have been studying Raft consensus and building a small key-value store. Would love 30 mins of guidance on system design interviews.",
        "status": "ACCEPTED",
        "date": "2026-10-12"
    },
    {
        "id": "ment-202",
        "mentor_id": "alm-002",
        "mentor_name": "Dr. Sunita Ramanathan",
        "student_name": "Deepika Nambiar",
        "student_roll": "23BEC084",
        "student_department": "Electronics & Communication",
        "year": "4th Year UG",
        "topic": "MS/PhD Applications in US Universities & Silicon Architecture",
        "message": "Ma'am, I am planning to apply for MS in Electrical & Computer Engineering for Fall 2027. Seeking advice on research statements.",
        "status": "PENDING",
        "date": "2026-10-17"
    }
]

# Jobs & Internships Board
JOBS = [
    {
        "id": "job-301",
        "title": "Software Engineer II - Distributed Infrastructure",
        "company": "Google Cloud",
        "location": "Bengaluru, India (Hybrid)",
        "experience": "1 - 3 Years / Freshers with High CGPA",
        "type": "Full-Time",
        "is_alumni_referral": True,
        "posted_by": "Vikramaditya Mehta ('18)",
        "posted_date": "2026-10-15",
        "description": "Looking for strong systems engineers skilled in Go/C++ and distributed consensus algorithms. I will personally review applications and refer top candidates."
    },
    {
        "id": "job-302",
        "title": "Founding AI Research Engineer (Intern to Full-Time)",
        "company": "Synthetix AI (YC W23)",
        "location": "San Francisco, CA / Remote",
        "experience": "Final Year Students / Recent Grads",
        "type": "Internship / Full-Time",
        "is_alumni_referral": True,
        "posted_by": "Pooja Varma ('19)",
        "posted_date": "2026-10-14",
        "description": "Work directly with the co-founders on LLM fine-tuning and agent architectures. Competitive USD stipend and equity upside."
    },
    {
        "id": "job-303",
        "title": "Battery Thermal Management Lead Engineer",
        "company": "Tata Motors EV Division",
        "location": "Pune, India",
        "experience": "3 - 6 Years",
        "type": "Full-Time",
        "is_alumni_referral": True,
        "posted_by": "Rajesh Kannan ('14)",
        "posted_date": "2026-10-10",
        "description": "Exciting role in EV battery pack cooling, CFD modeling, and crash safety analysis."
    }
]

# Fundraising Campaigns
CAMPAIGNS = [
    {
        "id": "cmp-401",
        "title": "Centre for Artificial Intelligence & Quantum Computing",
        "category": "Department Infrastructure & Research",
        "target_amount": 25000000, # 2.5 Crores
        "raised_amount": 16850000, # 1.68 Crores
        "donors_count": 384,
        "tax_exemption": "Section 80G Compliant (50% Deduction)",
        "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
        "description": "Establishing a state-of-the-art supercomputing cluster with 32 NVIDIA H100 GPUs to empower undergraduate and PhD student research."
    },
    {
        "id": "cmp-402",
        "title": "Class of 2001 Silver Jubilee Endowment for Rural Girls",
        "category": "Scholarships & Means Assistance",
        "target_amount": 10000000, # 1 Crore
        "raised_amount": 7450000, # 74.5 Lakhs
        "donors_count": 192,
        "tax_exemption": "Section 80G Compliant",
        "image": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
        "description": "Endowing 20 perpetual full-ride tuition scholarships for underprivileged girl students from rural districts."
    },
    {
        "id": "cmp-403",
        "title": "Student Emergency Medical & Hardship Relief Fund",
        "category": "Student Welfare",
        "target_amount": 3000000, # 30 Lakhs
        "raised_amount": 2840000, # 28.4 Lakhs
        "donors_count": 512,
        "tax_exemption": "Section 80G Compliant",
        "image": "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&auto=format&fit=crop&q=80",
        "description": "Immediate financial buffer for students encountering unforeseen family bereavement, accidents, or urgent medical emergencies."
    }
]

# Donation Transactions & 80G Receipts
DONATIONS = [
    {
        "donation_id": "DON-2026-9041",
        "campaign_id": "cmp-401",
        "campaign_title": "Centre for Artificial Intelligence & Quantum Computing",
        "donor_name": "Vikramaditya Mehta",
        "donor_email": "vikram.mehta@example.com",
        "donor_pan": "ABCDE1234F",
        "amount": 50000,
        "currency": "INR",
        "date": "2026-10-10",
        "receipt_number": "AIST/80G/2026-27/00492",
        "financial_year": "2026-2027",
        "status": "SUCCESS",
        "is_anonymous": False
    },
    {
        "donation_id": "DON-2026-9042",
        "campaign_id": "cmp-402",
        "campaign_title": "Class of 2001 Silver Jubilee Endowment",
        "donor_name": "Anonymous Alumnus",
        "donor_email": "donor@secret.org",
        "donor_pan": "XYZPK9988G",
        "amount": 250000,
        "currency": "INR",
        "date": "2026-10-14",
        "receipt_number": "AIST/80G/2026-27/00493",
        "financial_year": "2026-2027",
        "status": "SUCCESS",
        "is_anonymous": True
    }
]

# News & Stories
STORIES = [
    {
        "id": "st-501",
        "title": "Pooja Varma ('19) Raises $8M Series A for Enterprise AI Reasoning Agent",
        "category": "STARTUP & ENTREPRENEURSHIP",
        "date": "October 14, 2026",
        "batch": "Class of 2019 (CSE)",
        "read_time": "3 min read",
        "image": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80",
        "summary": "Synthetix AI, founded by our alumna Pooja Varma, announced its latest round led by prominent Silicon Valley venture capitalists to automate complex regulatory workflows."
    },
    {
        "id": "st-502",
        "title": "Karthik Subramanian, IAS ('12) Receives National Award for E-Governance Innovation",
        "category": "CIVIL SERVICES & IMPACT",
        "date": "October 08, 2026",
        "batch": "Class of 2012 (EEE)",
        "read_time": "4 min read",
        "image": "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80",
        "summary": "District Collector Karthik Subramanian was honored by the Ministry of Electronics & IT for digitizing rural land records and streamlining grievance redressal."
    },
    {
        "id": "st-503",
        "title": "Class of 1996 Golden Jubilee Lecture Hall Inaugurated on Main Campus",
        "category": "CAMPUS HERITAGE",
        "date": "September 29, 2026",
        "batch": "Class of 1996",
        "read_time": "2 min read",
        "image": "https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80",
        "summary": "The Director and Dean formally opened the renovated high-tech 250-seater multimedia amphitheatre gifted collectively by the graduating class of 1996."
    }
]

# Communication Campaigns
CAMPAIGNS_COMM = [
    {
        "id": "comm-601",
        "name": "Silver Jubilee Reunion Invitations - Round 1",
        "channel": "WHATSAPP_AND_EMAIL",
        "target_segment": "Graduates of Batch 2001 (All Departments)",
        "recipient_count": 820,
        "sent_at": "2026-10-01 10:30 AM",
        "open_rate": "89.4%",
        "click_rate": "62.1%",
        "status": "COMPLETED"
    },
    {
        "id": "comm-602",
        "name": "Annual Alumni Graduate Outcome Survey (NIRF 2027)",
        "channel": "EMAIL_AND_SMS",
        "target_segment": "Batches 2021, 2023, 2025",
        "recipient_count": 4250,
        "sent_at": "2026-10-12 04:00 PM",
        "open_rate": "68.2%",
        "click_rate": "41.5%",
        "status": "ACTIVE"
    }
]

# Data Governance & Duplicate Merges
DUPLICATE_FLAGS = [
    {
        "id": "dup-701",
        "confidence_score": 94,
        "match_reason": "Identical Birthdate, Same Department (CSE), Levenshtein Distance 0.92 on Full Name",
        "record_a": {
            "source": "Legacy 2018 Excel Roster",
            "name": "Rahul Verma",
            "enrolment_no": "14BCS092",
            "email": "r.verma.2014@gmail.com",
            "company": "Infosys Ltd"
        },
        "record_b": {
            "source": "Self-Registration Portal",
            "name": "Rahul K. Verma",
            "enrolment_no": "14BCS092",
            "email": "rahul.verma@uber.com",
            "company": "Uber Technologies (Senior Staff Engineer)"
        },
        "status": "REQUIRES_MERGE"
    }
]

# DPDP Act 2023 Audit & Consent Logs
CONSENT_AUDIT_LOGS = [
    {
        "id": "dpdp-801",
        "timestamp": "2026-10-18 09:12:44",
        "user_email": "vikram.mehta@example.com",
        "event_type": "CONSENT_UPDATED",
        "details": "Granted consent for Directory Search (Batch only) and WhatsApp Event Alerts.",
        "ip_address": "106.51.78.21"
    },
    {
        "id": "dpdp-802",
        "timestamp": "2026-10-17 14:22:10",
        "user_email": "ananya.d@example.com",
        "event_type": "DATA_EXPORT_REQUESTED",
        "details": "Initiated full self-service PII export archive in JSON format.",
        "ip_address": "82.165.197.1"
    },
    {
        "id": "dpdp-803",
        "timestamp": "2026-10-15 11:05:32",
        "user_email": "admin.alumni@apex.edu.in",
        "event_type": "ADMIN_PII_VIEW",
        "details": "Alumni Office Admin viewed unmasked contact for verification approval.",
        "ip_address": "14.139.122.9"
    }
]

# -------------------------------------------------------------
# PYDANTIC SCHEMAS
# -------------------------------------------------------------

class EnrolmentVerifyRequest(BaseModel):
    enrolment_no: str
    passing_year: int
    department: str

class OTPVerifyRequest(BaseModel):
    enrolment_no: str
    otp: str

class ManualClaimRequest(BaseModel):
    name: str
    enrolment_no: str
    department: str
    graduation_year: int
    email: str
    linkedin_url: Optional[str] = None
    document_name: str

class DonationRequest(BaseModel):
    campaign_id: str
    amount: float
    donor_name: str
    donor_email: str
    donor_pan: str
    is_anonymous: bool = False
    payment_method: str = "UPI"

class MentorshipApplyRequest(BaseModel):
    mentor_id: str
    student_name: str
    student_roll: str
    student_department: str
    year: str
    topic: str
    message: str

class EventBookingRequest(BaseModel):
    event_id: str
    attendee_name: str
    enrolment_no: str
    ticket_type: str = "Standard Alumnus Pass"

class BroadcastRequest(BaseModel):
    name: str
    channel: str
    target_segment: str
    message_content: str

# -------------------------------------------------------------
# API ROUTE CONTROLLERS
# -------------------------------------------------------------

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "institution": "Apex Institute of Science & Technology",
        "version": "1.0.0"
    }

# 1. Registration & Verification
@app.post("/api/v1/auth/verify-enrolment")
def verify_enrolment(payload: EnrolmentVerifyRequest):
    for r in ERP_ROSTER:
        if r["enrolment_no"].strip().upper() == payload.enrolment_no.strip().upper():
            if r["passing_year"] == payload.passing_year:
                # Mask phone and email for security
                masked_email = r["email"][:2] + "****@" + r["email"].split("@")[-1]
                masked_phone = r["phone"][:5] + " ****" + r["phone"][-2:]
                return {
                    "matched": True,
                    "name": r["name"],
                    "enrolment_no": r["enrolment_no"],
                    "department": r["department"],
                    "masked_email": masked_email,
                    "masked_phone": masked_phone,
                    "claimed": r["claimed"],
                    "message": "Record found in pre-seeded SIS database. OTP dispatched to registered phone/email."
                }
    return {
        "matched": False,
        "message": "Enrolment record not found in instant lookup. Please submit a manual verification request with degree certificate."
    }

@app.post("/api/v1/auth/verify-otp")
def verify_otp(payload: OTPVerifyRequest):
    # Simulated OTP check (accept '123456' or any 6-digit OTP for demo)
    if payload.otp and len(payload.otp) == 6:
        for r in ERP_ROSTER:
            if r["enrolment_no"].strip().upper() == payload.enrolment_no.strip().upper():
                r["claimed"] = True
                return {
                    "success": True,
                    "token": f"jwt-session-{uuid.uuid4()}",
                    "name": r["name"],
                    "enrolment_no": r["enrolment_no"],
                    "message": "Verification successful! Welcome to the Central Alumni Network."
                }
        return {"success": True, "token": f"jwt-session-{uuid.uuid4()}", "message": "Verification successful!"}
    raise HTTPException(status_code=400, detail="Invalid OTP code entered. Please enter a valid 6-digit code.")

@app.post("/api/v1/auth/manual-claim")
def submit_manual_claim(payload: ManualClaimRequest):
    claim_id = f"claim-{random.randint(100, 999)}"
    record = payload.model_dump()
    record["id"] = claim_id
    record["submission_date"] = datetime.now().strftime("%Y-%m-%d")
    record["status"] = "PENDING"
    PENDING_VERIFICATIONS.append(record)
    return {
        "success": True,
        "claim_id": claim_id,
        "message": "Your verification request has been queued for Alumni Office review. You will receive an activation email within 24-48 hours."
    }

# 2. Profiles & Directory
@app.get("/api/v1/profiles")
def get_profiles(
    search: Optional[str] = None,
    department: Optional[str] = None,
    graduation_year: Optional[int] = None,
    city: Optional[str] = None,
    mentor_only: Optional[bool] = None,
    hire_only: Optional[bool] = None
):
    results = ALUMNI_PROFILES.copy()
    if search:
        s = search.lower()
        results = [
            p for p in results if (
                s in p["name"].lower() or
                s in p["company"].lower() or
                s in p["designation"].lower() or
                s in p["city"].lower() or
                any(s in sk.lower() for sk in p["skills"])
            )
        ]
    if department:
        results = [p for p in results if p["department"].lower() == department.lower()]
    if graduation_year:
        results = [p for p in results if p["graduation_year"] == graduation_year]
    if city:
        results = [p for p in results if city.lower() in p["city"].lower()]
    if mentor_only:
        results = [p for p in results if p["willing_to_mentor"]]
    if hire_only:
        results = [p for p in results if p["willing_to_hire"]]
    return {"count": len(results), "profiles": results}

@app.get("/api/v1/profiles/{profile_id}")
def get_profile_by_id(profile_id: str):
    for p in ALUMNI_PROFILES:
        if p["id"] == profile_id:
            return p
    raise HTTPException(status_code=404, detail="Alumni profile not found.")

@app.put("/api/v1/profiles/{profile_id}")
def update_profile(profile_id: str, data: Dict[str, Any] = Body(...)):
    for p in ALUMNI_PROFILES:
        if p["id"] == profile_id:
            p.update(data)
            return {"success": True, "profile": p, "message": "Profile updated successfully."}
    raise HTTPException(status_code=404, detail="Alumni profile not found.")

# 3. Events & Ticketing
@app.get("/api/v1/events")
def get_events():
    return {"events": EVENTS}

@app.post("/api/v1/events/book")
def book_event(payload: EventBookingRequest):
    ticket_id = f"TKT-AIST-2026-{random.randint(1000, 9999)}"
    ticket = {
        "ticket_id": ticket_id,
        "event_id": payload.event_id,
        "user_name": payload.attendee_name,
        "enrolment_no": payload.enrolment_no,
        "ticket_type": payload.ticket_type,
        "amount_paid": 4500 if payload.ticket_type != "Student Pass" else 0,
        "qr_code": f"{ticket_id}-VERIFIED-CAMPUS-PASS",
        "status": "CONFIRMED"
    }
    EVENT_TICKETS.append(ticket)
    # Increment event attendee count
    for ev in EVENTS:
        if ev["id"] == payload.event_id:
            ev["registered_count"] += 1
    return {
        "success": True,
        "ticket": ticket,
        "message": "Ticket successfully issued! Pass and QR code dispatched to your registered WhatsApp & Email."
    }

# 4. Mentorship & Career Network
@app.get("/api/v1/mentorship/requests")
def get_mentorship_requests():
    return {"requests": MENTORSHIP_REQUESTS}

@app.post("/api/v1/mentorship/apply")
def apply_mentorship(payload: MentorshipApplyRequest):
    req_id = f"ment-{random.randint(300, 999)}"
    mentor_name = "Alumnus Mentor"
    for p in ALUMNI_PROFILES:
        if p["id"] == payload.mentor_id:
            mentor_name = p["name"]
            break
    new_req = {
        "id": req_id,
        "mentor_id": payload.mentor_id,
        "mentor_name": mentor_name,
        "student_name": payload.student_name,
        "student_roll": payload.student_roll,
        "student_department": payload.student_department,
        "year": payload.year,
        "topic": payload.topic,
        "message": payload.message,
        "status": "PENDING",
        "date": datetime.now().strftime("%Y-%m-%d")
    }
    MENTORSHIP_REQUESTS.append(new_req)
    return {
        "success": True,
        "request": new_req,
        "message": "Mentorship request sent! The mentor will be notified on their dashboard and email."
    }

@app.get("/api/v1/jobs")
def get_jobs():
    return {"jobs": JOBS}

@app.post("/api/v1/jobs")
def post_job(data: Dict[str, Any] = Body(...)):
    job_id = f"job-{random.randint(400, 999)}"
    data["id"] = job_id
    data["posted_date"] = datetime.now().strftime("%Y-%m-%d")
    JOBS.insert(0, data)
    return {"success": True, "job": data, "message": "Job opportunity posted successfully!"}

# 5. Donations & Section 80G Tax Certificates
@app.get("/api/v1/campaigns")
def get_campaigns():
    return {"campaigns": CAMPAIGNS}

@app.post("/api/v1/donations/checkout")
def checkout_donation(payload: DonationRequest):
    donation_id = f"DON-2026-{random.randint(1000, 9999)}"
    receipt_number = f"AIST/80G/2026-27/{random.randint(10000, 99999)}"
    
    # Locate campaign
    campaign_title = "Apex Excellence Endowment"
    for c in CAMPAIGNS:
        if c["id"] == payload.campaign_id:
            c["raised_amount"] += payload.amount
            c["donors_count"] += 1
            campaign_title = c["title"]
            break

    donation_record = {
        "donation_id": donation_id,
        "campaign_id": payload.campaign_id,
        "campaign_title": campaign_title,
        "donor_name": payload.donor_name if not payload.is_anonymous else "Anonymous Patron",
        "donor_email": payload.donor_email,
        "donor_pan": payload.donor_pan.upper(),
        "amount": payload.amount,
        "currency": "INR",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "receipt_number": receipt_number,
        "financial_year": "2026-2027",
        "status": "SUCCESS",
        "is_anonymous": payload.is_anonymous
    }
    DONATIONS.insert(0, donation_record)
    return {
        "success": True,
        "donation": donation_record,
        "receipt": {
            "receipt_number": receipt_number,
            "institution_pan": "AAATA0091K",
            "institution_80g_reg": "CIT(E)/BLR/80G/2021-22/A/10294",
            "donor_pan": payload.donor_pan.upper(),
            "eligible_deduction_pct": 50,
            "download_url": f"/api/v1/donations/receipts/{receipt_number}"
        },
        "message": "Payment processed successfully! Your Section 80G Tax Exemption Certificate is ready."
    }

@app.get("/api/v1/donations/recent")
def get_recent_donations():
    return {"donations": DONATIONS}

# 6. Stories & News
@app.get("/api/v1/stories")
def get_stories():
    return {"stories": STORIES}

# 7. Communications Hub
@app.get("/api/v1/communications")
def get_communications():
    return {"campaigns": CAMPAIGNS_COMM}

@app.post("/api/v1/communications/broadcast")
def broadcast_campaign(payload: BroadcastRequest):
    comm_id = f"comm-{random.randint(700, 999)}"
    recipients = 1250 if "Batch" in payload.target_segment else 3500
    record = {
        "id": comm_id,
        "name": payload.name,
        "channel": payload.channel,
        "target_segment": payload.target_segment,
        "recipient_count": recipients,
        "sent_at": datetime.now().strftime("%Y-%m-%d %I:%M %p"),
        "open_rate": "Just Launched",
        "click_rate": "--",
        "status": "PROCESSING"
    }
    CAMPAIGNS_COMM.insert(0, record)
    return {
        "success": True,
        "campaign": record,
        "message": f"Broadcast queued successfully across {payload.channel} to {recipients} verified alumni."
    }

# 8. Data Governance, Duplicates & DPDP Logs
@app.get("/api/v1/governance/duplicates")
def get_duplicates():
    return {"duplicates": DUPLICATE_FLAGS}

@app.post("/api/v1/governance/duplicates/{dup_id}/resolve")
def resolve_duplicate(dup_id: str, choice: str = Query("MERGE_TO_B")):
    for d in DUPLICATE_FLAGS:
        if d["id"] == dup_id:
            d["status"] = "RESOLVED"
            CONSENT_AUDIT_LOGS.insert(0, {
                "id": f"dpdp-{random.randint(900, 999)}",
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "user_email": "admin.alumni@apex.edu.in",
                "event_type": "DUPLICATE_MERGE",
                "details": f"Resolved duplicate flag {dup_id} adopting preferred record {choice}.",
                "ip_address": "14.139.122.9"
            })
            return {"success": True, "message": "Duplicate successfully merged and audited."}
    raise HTTPException(status_code=404, detail="Duplicate record not found.")

@app.get("/api/v1/governance/audit-logs")
def get_audit_logs():
    return {"logs": CONSENT_AUDIT_LOGS}

@app.get("/api/v1/governance/pending-claims")
def get_pending_claims():
    return {"claims": PENDING_VERIFICATIONS}

@app.post("/api/v1/governance/pending-claims/{claim_id}/approve")
def approve_claim(claim_id: str):
    for c in PENDING_VERIFICATIONS:
        if c["id"] == claim_id:
            c["status"] = "APPROVED"
            return {"success": True, "message": f"Claim {claim_id} approved. Activation email dispatched."}
    raise HTTPException(status_code=404, detail="Claim not found.")

# 9. Institutional Analytics
@app.get("/api/v1/analytics/summary")
def get_analytics():
    return {
        "kpis": {
            "total_alumni": 50240,
            "verified_alumni": 31480,
            "verification_pct": 62.7,
            "annual_giving_inr": 27140000, # 2.71 Cr
            "active_mentorships": 420,
            "nirf_outcome_tracked_pct": 74.8
        },
        "geographic_distribution": [
            {"region": "India (Metro & Tech Hubs)", "count": 36150, "pct": 72},
            {"region": "United States (Silicon Valley, NY, WA)", "count": 8540, "pct": 17},
            {"region": "Europe & United Kingdom", "count": 2510, "pct": 5},
            {"region": "Singapore & Southeast Asia", "count": 1820, "pct": 3.6},
            {"region": "Middle East & Others", "count": 1220, "pct": 2.4}
        ],
        "top_employers": [
            {"company": "Google", "count": 480},
            {"company": "Microsoft", "count": 430},
            {"company": "Amazon", "count": 520},
            {"company": "Tata Consultancy Services", "count": 1420},
            {"company": "McKinsey & Bain", "count": 190},
            {"company": "ISRO / DRDO / Govt Services", "count": 310}
        ],
        "industry_sectors": [
            {"sector": "Software & AI Tech", "pct": 42},
            {"sector": "Core Engineering & Automotive", "pct": 21},
            {"sector": "Financial Services & FinTech", "pct": 14},
            {"sector": "Management Consulting", "pct": 9},
            {"sector": "Higher Education & Research", "pct": 8},
            {"sector": "Civil Services & Public Policy", "pct": 6}
        ],
        "giving_trend": [
            {"year": "2022", "amount_cr": 0.85},
            {"year": "2023", "amount_cr": 1.40},
            {"year": "2024", "amount_cr": 1.95},
            {"year": "2025", "amount_cr": 2.20},
            {"year": "2026 (YTD)", "amount_cr": 2.71}
        ]
    }

# -------------------------------------------------------------
# STATIC FILE SERVING
# -------------------------------------------------------------
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
def serve_index():
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Apex Alumni Platform API is running. index.html not found in static folder."}
