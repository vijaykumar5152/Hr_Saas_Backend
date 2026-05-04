# HR Recruitment SaaS API Documentation

## Overview
Complete backend API for HR Recruitment SaaS with authentication, job management, candidate tracking, interview scheduling, and subscription billing.

---

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Table of Contents
1. [Authentication](#authentication)
2. [Dashboard](#dashboard)
3. [Jobs](#jobs)
4. [Candidates](#candidates)
5. [Notes & Ratings](#notes--ratings)
6. [Interview Scheduling](#interview-scheduling)
7. [Team Management](#team-management)
8. [Subscriptions & Billing](#subscriptions--billing)

---

## Authentication

### 1. Company Registration
**POST** `/auth/company/register`

Register a new company account.

**Request Body:**
```json
{
  "company_name": "Acme Corp",
  "email": "admin@acme.com",
  "password": "Password123!",
  "confirm_password": "Password123!",
  "industry": "Technology",
  "website": "https://acme.com"
}
```

**Response (201):**
```json
{
  "message": "Company registered successfully",
  "token": "jwt_token",
  "company": {
    "id": 1,
    "name": "Acme Corp",
    "email": "admin@acme.com"
  }
}
```

---

### 2. Company Login
**POST** `/auth/company/login`

Login to company account.

**Request Body:**
```json
{
  "email": "admin@acme.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "jwt_token",
  "company": {
    "id": 1,
    "name": "Acme Corp",
    "email": "admin@acme.com",
    "subscription_plan": "free"
  }
}
```

---

### 3. Add Team Member
**POST** `/auth/register`

Add a new HR team member (admin only).

**Request Body:**
```json
{
  "company_id": 1,
  "full_name": "John Doe",
  "email": "john@acme.com",
  "password": "Password123!",
  "confirm_password": "Password123!",
  "role": "hr"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token",
  "user": {
    "id": 2,
    "name": "John Doe",
    "email": "john@acme.com",
    "role": "hr"
  }
}
```

---

### 4. Team Member Login
**POST** `/auth/login`

Login as a team member.

**Request Body:**
```json
{
  "email": "john@acme.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "jwt_token",
  "user": {
    "id": 2,
    "name": "John Doe",
    "email": "john@acme.com",
    "role": "hr"
  }
}
```

---

### 5. Get Current User
**GET** `/auth/me` 🔒

Get logged-in user profile.

**Response (200):**
```json
{
  "id": 2,
  "company_id": 1,
  "full_name": "John Doe",
  "email": "john@acme.com",
  "role": "hr",
  "is_active": true,
  "created_at": "2024-04-27T10:30:00Z"
}
```

---

### 6. Get Company Profile
**GET** `/auth/company/profile` 🔒

Get company information.

**Response (200):**
```json
{
  "id": 1,
  "company_name": "Acme Corp",
  "email": "admin@acme.com",
  "industry": "Technology",
  "website": "https://acme.com",
  "subscription_plan": "free",
  "is_active": true,
  "created_at": "2024-04-27T10:00:00Z"
}
```

---

### 7. Update Company Profile
**PUT** `/auth/company/profile` 🔒

Update company information.

**Request Body:**
```json
{
  "company_name": "Acme Corp Updated",
  "industry": "Tech & Software",
  "website": "https://newacme.com",
  "employees_count": 150
}
```

**Response (200):**
```json
{
  "message": "Company profile updated successfully"
}
```

---

## Dashboard

### 1. Get Dashboard Stats
**GET** `/dashboard/stats` 🔒

Get key metrics for the dashboard.

**Response (200):**
```json
{
  "open_jobs": 5,
  "total_candidates": 45,
  "interviews_today": 3,
  "hired_this_month": 8,
  "stage_breakdown": [
    { "stage": "Applied", "count": 20 },
    { "stage": "Screening", "count": 15 },
    { "stage": "Interview", "count": 8 },
    { "stage": "Final Round", "count": 2 },
    { "stage": "Selected", "count": 0 },
    { "stage": "Rejected", "count": 0 }
  ]
}
```

---

### 2. Get Detailed Dashboard
**GET** `/dashboard/detailed` 🔒

Get detailed dashboard information.

**Response (200):**
```json
{
  "recent_candidates": [
    {
      "id": 1,
      "full_name": "Jane Smith",
      "email": "jane@example.com",
      "stage": "Interview",
      "job_title": "Frontend Developer",
      "created_at": "2024-04-27T09:15:00Z"
    }
  ],
  "upcoming_interviews": [
    {
      "id": 1,
      "candidate_name": "Jane Smith",
      "interviewer_name": "John Doe",
      "job_title": "Frontend Developer",
      "scheduled_date": "2024-04-28T14:00:00Z"
    }
  ],
  "top_performers": [
    {
      "id": 1,
      "full_name": "Jane Smith",
      "avg_rating": 4.8
    }
  ],
  "job_statistics": [
    {
      "title": "Frontend Developer",
      "applications": 12
    }
  ]
}
```

---

## Jobs

### 1. Create Job
**POST** `/jobs` 🔒 (admin, hr only)

Create a new job posting.

**Request Body:**
```json
{
  "title": "Frontend Developer",
  "department": "Engineering",
  "location": "New York, NY",
  "salary_min": 80000,
  "salary_max": 120000,
  "description": "Looking for an experienced frontend developer...",
  "requirements": "5+ years experience with React, TypeScript...",
  "status": "open"
}
```

**Response (201):**
```json
{
  "id": 1,
  "title": "Frontend Developer",
  "department": "Engineering",
  "location": "New York, NY",
  "salary_min": 80000,
  "salary_max": 120000,
  "status": "open"
}
```

---

### 2. Get All Jobs
**GET** `/jobs` 🔒

Get all job postings.

**Query Parameters:**
- `status`: Filter by status (open/closed)

**Response (200):**
```json
[
  {
    "id": 1,
    "company_id": 1,
    "title": "Frontend Developer",
    "department": "Engineering",
    "location": "New York, NY",
    "salary_min": 80000,
    "salary_max": 120000,
    "status": "open",
    "applications_count": 12,
    "created_by_name": "John Doe",
    "created_at": "2024-04-27T10:00:00Z"
  }
]
```

---

### 3. Get Job by ID
**GET** `/jobs/:id` 🔒

Get a specific job posting.

**Response (200):**
```json
{
  "id": 1,
  "company_id": 1,
  "title": "Frontend Developer",
  "department": "Engineering",
  "location": "New York, NY",
  "salary_min": 80000,
  "salary_max": 120000,
  "description": "Looking for an experienced frontend developer...",
  "requirements": "5+ years experience with React, TypeScript...",
  "status": "open",
  "created_by": 2,
  "created_at": "2024-04-27T10:00:00Z"
}
```

---

### 4. Update Job
**PUT** `/jobs/:id` 🔒 (admin, hr only)

Update job posting.

**Request Body:**
```json
{
  "title": "Senior Frontend Developer",
  "salary_min": 100000,
  "salary_max": 150000",
  "status": "open"
}
```

**Response (200):**
```json
{
  "message": "Job updated successfully"
}
```

---

### 5. Close Job
**PUT** `/jobs/:id/close` 🔒 (admin, hr only)

Close a job posting.

**Response (200):**
```json
{
  "message": "Job closed successfully"
}
```

---

### 6. Get Job Statistics
**GET** `/jobs/:id/stats` 🔒

Get statistics for a specific job.

**Response (200):**
```json
{
  "job": {
    "id": 1,
    "title": "Frontend Developer",
    "department": "Engineering"
  },
  "total_applications": 15,
  "stage_breakdown": [
    { "stage": "Applied", "count": 8 },
    { "stage": "Screening", "count": 5 },
    { "stage": "Interview", "count": 2 }
  ]
}
```

---

## Candidates

### 1. Add Candidate
**POST** `/candidates` 🔒 (admin, hr, recruiter)

Add a new candidate.

**Request Body:**
```json
{
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "5551234567",
  "job_id": 1,
  "experience_years": 5,
  "skills": ["React", "TypeScript", "Node.js"],
  "resume_url": "https://s3.amazonaws.com/resumes/jane-smith.pdf",
  "source": "LinkedIn",
  "stage": "Applied"
}
```

**Response (201):**
```json
{
  "id": 1,
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "5551234567",
  "job_id": 1,
  "stage": "Applied"
}
```

---

### 2. Get All Candidates
**GET** `/candidates` 🔒

Get all candidates.

**Query Parameters:**
- `job_id`: Filter by job
- `stage`: Filter by stage (Applied, Screening, Interview, Final Round, Selected, Rejected)
- `status`: Filter by status (active, rejected, selected)

**Response (200):**
```json
[
  {
    "id": 1,
    "company_id": 1,
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "5551234567",
    "job_id": 1,
    "job_title": "Frontend Developer",
    "stage": "Applied",
    "experience_years": 5,
    "skills": ["React", "TypeScript", "Node.js"],
    "status": "active",
    "created_at": "2024-04-27T11:00:00Z"
  }
]
```

---

### 3. Get Candidate by ID
**GET** `/candidates/:id` 🔒

Get a specific candidate.

**Response (200):**
```json
{
  "id": 1,
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "5551234567",
  "job_id": 1,
  "stage": "Applied",
  "experience_years": 5,
  "skills": ["React", "TypeScript", "Node.js"],
  "resume_url": "https://s3.amazonaws.com/resumes/jane-smith.pdf",
  "status": "active"
}
```

---

### 4. Update Candidate
**PUT** `/candidates/:id` 🔒 (admin, hr, recruiter)

Update candidate information.

**Request Body:**
```json
{
  "full_name": "Jane Smith Updated",
  "experience_years": 6,
  "skills": ["React", "TypeScript", "Node.js", "GraphQL"]
}
```

**Response (200):**
```json
{
  "message": "Candidate updated successfully"
}
```

---

### 5. Update Candidate Stage
**PUT** `/candidates/:id/stage` 🔒 (admin, hr only)

Update candidate's pipeline stage.

**Request Body:**
```json
{
  "stage": "Interview",
  "status": "active"
}
```

**Response (200):**
```json
{
  "message": "Candidate updated successfully"
}
```

---

### 6. Delete Candidate
**DELETE** `/candidates/:id` 🔒 (admin only)

Delete a candidate.

**Response (200):**
```json
{
  "message": "Candidate deleted successfully"
}
```

---

## Notes & Ratings

### 1. Add Note
**POST** `/notes` 🔒 (admin, hr, recruiter)

Add a note to a candidate.

**Request Body:**
```json
{
  "candidate_id": 1,
  "rating": 4.5,
  "note": "Great communication skills, strong technical background",
  "tags": ["communication", "technical", "team-player"]
}
```

**Response (201):**
```json
{
  "id": 1,
  "candidate_id": 1,
  "rating": 4.5,
  "note": "Great communication skills, strong technical background",
  "tags": ["communication", "technical", "team-player"],
  "created_by": "John Doe",
  "created_at": "2024-04-27T14:30:00Z"
}
```

---

### 2. Get Notes for Candidate
**GET** `/notes/candidate/:candidate_id` 🔒

Get all notes for a candidate.

**Response (200):**
```json
[
  {
    "id": 1,
    "candidate_id": 1,
    "rating": 4.5,
    "note": "Great communication skills",
    "tags": ["communication", "technical"],
    "created_by": "John Doe",
    "created_at": "2024-04-27T14:30:00Z"
  }
]
```

---

### 3. Get Candidate Rating
**GET** `/notes/candidate/:candidate_id/rating` 🔒

Get average rating for a candidate.

**Response (200):**
```json
{
  "candidate_id": 1,
  "average_rating": 4.5,
  "total_ratings": 3
}
```

---

### 4. Update Note
**PUT** `/notes/:id` 🔒

Update a note.

**Request Body:**
```json
{
  "rating": 4.8,
  "note": "Excellent communication and technical skills"
}
```

**Response (200):**
```json
{
  "message": "Note updated successfully"
}
```

---

### 5. Delete Note
**DELETE** `/notes/:id` 🔒

Delete a note.

**Response (200):**
```json
{
  "message": "Note deleted successfully"
}
```

---

## Interview Scheduling

### 1. Schedule Interview
**POST** `/interviews` 🔒 (admin, hr only)

Schedule an interview.

**Request Body:**
```json
{
  "candidate_id": 1,
  "job_id": 1,
  "interviewer_id": 2,
  "scheduled_date": "2024-04-28T14:00:00Z",
  "duration_minutes": 45,
  "interview_type": "technical",
  "meet_link": "https://zoom.us/meeting/123",
  "notes": "Technical interview focusing on React"
}
```

**Response (201):**
```json
{
  "id": 1,
  "candidate_id": 1,
  "job_id": 1,
  "scheduled_date": "2024-04-28T14:00:00Z",
  "interview_type": "technical",
  "message": "Interview scheduled successfully"
}
```

---

### 2. Get All Interviews
**GET** `/interviews` 🔒

Get all interviews.

**Query Parameters:**
- `candidate_id`: Filter by candidate
- `job_id`: Filter by job
- `status`: Filter by status (scheduled, completed, cancelled)
- `date_from`: Filter from date
- `date_to`: Filter to date

**Response (200):**
```json
[
  {
    "id": 1,
    "candidate_id": 1,
    "candidate_name": "Jane Smith",
    "job_id": 1,
    "job_title": "Frontend Developer",
    "scheduled_date": "2024-04-28T14:00:00Z",
    "interviewer_name": "John Doe",
    "interview_type": "technical",
    "status": "scheduled",
    "meet_link": "https://zoom.us/meeting/123"
  }
]
```

---

### 3. Get Today's Interviews
**GET** `/interviews/today` 🔒

Get interviews scheduled for today.

**Response (200):**
```json
[
  {
    "id": 1,
    "candidate_name": "Jane Smith",
    "scheduled_date": "2024-04-27T14:00:00Z",
    "interview_type": "technical",
    "status": "scheduled"
  }
]
```

---

### 4. Get Upcoming Interviews
**GET** `/interviews/upcoming` 🔒

Get upcoming interviews.

**Query Parameters:**
- `days`: Number of days to look ahead (default: 7)

**Response (200):**
```json
[...]
```

---

### 5. Get Interview by ID
**GET** `/interviews/:id` 🔒

Get a specific interview.

**Response (200):**
```json
{
  "id": 1,
  "candidate_id": 1,
  "candidate_name": "Jane Smith",
  "job_id": 1,
  "job_title": "Frontend Developer",
  "scheduled_date": "2024-04-28T14:00:00Z",
  "interviewer_name": "John Doe",
  "interview_type": "technical",
  "status": "scheduled",
  "meet_link": "https://zoom.us/meeting/123",
  "notes": "Technical interview focusing on React"
}
```

---

### 6. Update Interview
**PUT** `/interviews/:id` 🔒 (admin, hr only)

Update interview details.

**Request Body:**
```json
{
  "scheduled_date": "2024-04-28T15:00:00Z",
  "meet_link": "https://zoom.us/meeting/456"
}
```

**Response (200):**
```json
{
  "message": "Interview updated successfully"
}
```

---

### 7. Add Interview Feedback
**PUT** `/interviews/:id/feedback` 🔒 (admin, hr only)

Add feedback after interview.

**Request Body:**
```json
{
  "feedback": "Strong technical skills, good communication. Ready for final round.",
  "status": "completed"
}
```

**Response (200):**
```json
{
  "message": "Feedback added successfully"
}
```

---

### 8. Cancel Interview
**PUT** `/interviews/:id/cancel` 🔒 (admin, hr only)

Cancel an interview.

**Response (200):**
```json
{
  "message": "Interview cancelled successfully"
}
```

---

## Team Management

### 1. Get Team Members
**GET** `/team` 🔒 (admin only)

Get all team members.

**Response (200):**
```json
[
  {
    "id": 2,
    "full_name": "John Doe",
    "email": "john@acme.com",
    "role": "hr",
    "is_active": true,
    "created_at": "2024-04-27T10:30:00Z"
  }
]
```

---

### 2. Add Team Member
**POST** `/team` 🔒 (admin only)

Add a new team member.

**Request Body:**
```json
{
  "full_name": "Sarah Johnson",
  "email": "sarah@acme.com",
  "role": "recruiter"
}
```

**Response (201):**
```json
{
  "message": "Team member added successfully",
  "user": {
    "id": 3,
    "full_name": "Sarah Johnson",
    "email": "sarah@acme.com",
    "role": "recruiter",
    "temporary_password": "TempPass123"
  }
}
```

---

### 3. Update Team Member
**PUT** `/team/:id` 🔒 (admin only)

Update team member.

**Request Body:**
```json
{
  "full_name": "Sarah Johnson Updated",
  "role": "hr"
}
```

**Response (200):**
```json
{
  "message": "Team member updated successfully"
}
```

---

### 4. Remove Team Member
**DELETE** `/team/:id` 🔒 (admin only)

Remove a team member.

**Response (200):**
```json
{
  "message": "Team member removed successfully"
}
```

---

### 5. Change Password
**POST** `/team/change-password` 🔒

Change password (any authenticated user).

**Request Body:**
```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewPassword123!",
  "confirm_password": "NewPassword123!"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

---

## Subscriptions & Billing

### 1. Get Available Plans
**GET** `/subscriptions/plans`

Get all subscription plans.

**Response (200):**
```json
{
  "free": {
    "name": "Free",
    "price": 0,
    "features": {
      "max_jobs": 2,
      "max_candidates": 20,
      "max_team_members": 1,
      "interview_scheduling": false,
      "kanban_board": false
    }
  },
  "basic": {
    "name": "Basic",
    "price": 999,
    "features": {
      "max_jobs": 10,
      "max_candidates": 100,
      "max_team_members": 3,
      "interview_scheduling": true,
      "kanban_board": false
    }
  },
  "professional": {
    "name": "Professional",
    "price": 2999,
    "features": {
      "max_jobs": 50,
      "max_candidates": 500,
      "max_team_members": 10,
      "interview_scheduling": true,
      "kanban_board": true
    }
  }
}
```

---

### 2. Get Current Subscription
**GET** `/subscriptions/current` 🔒

Get current subscription.

**Response (200):**
```json
{
  "id": 1,
  "company_id": 1,
  "plan_type": "free",
  "price": 0,
  "start_date": "2024-04-27T10:00:00Z",
  "is_active": true,
  "plan_details": {
    "name": "Free",
    "price": 0,
    "features": {...}
  }
}
```

---

### 3. Get Subscription Features
**GET** `/subscriptions/features` 🔒

Get features available in current subscription.

**Response (200):**
```json
{
  "max_jobs": 2,
  "max_candidates": 20,
  "max_team_members": 1,
  "interview_scheduling": false,
  "custom_notes": false,
  "kanban_board": false
}
```

---

### 4. Upgrade Subscription
**POST** `/subscriptions/upgrade` 🔒 (admin only)

Upgrade to a different plan.

**Request Body:**
```json
{
  "plan_type": "professional",
  "razorpay_subscription_id": "sub_12345"
}
```

**Response (201):**
```json
{
  "message": "Subscription upgraded successfully",
  "subscription_id": 2,
  "plan_type": "professional",
  "amount": 2999,
  "billing_cycle": "monthly"
}
```

---

### 5. Cancel Subscription
**POST** `/subscriptions/cancel` 🔒 (admin only)

Cancel current subscription (downgrade to free).

**Response (200):**
```json
{
  "message": "Subscription cancelled successfully"
}
```

---

### 6. Get Billing History
**GET** `/subscriptions/billing/history` 🔒

Get billing history.

**Response (200):**
```json
{
  "subscriptions": [...],
  "invoices": [...]
}
```

---

### 7. Get Invoices
**GET** `/subscriptions/invoices` 🔒

Get all invoices.

**Query Parameters:**
- `status`: Filter by status (issued, paid, pending, overdue, cancelled)

**Response (200):**
```json
[
  {
    "id": 1,
    "subscription_id": 1,
    "amount": 2999,
    "currency": "INR",
    "status": "paid",
    "issue_date": "2024-04-27T10:00:00Z",
    "paid_date": "2024-04-27T12:00:00Z"
  }
]
```

---

### 8. Get Invoice by ID
**GET** `/subscriptions/invoices/:id` 🔒

Get a specific invoice.

**Response (200):**
```json
{
  "id": 1,
  "subscription_id": 1,
  "razorpay_invoice_id": "inv_12345",
  "amount": 2999,
  "currency": "INR",
  "status": "paid",
  "issue_date": "2024-04-27T10:00:00Z",
  "due_date": "2024-05-27T10:00:00Z",
  "paid_date": "2024-04-27T12:00:00Z"
}
```

---

### 9. Create Invoice
**POST** `/subscriptions/invoices` 🔒 (admin only)

Create invoice (called after payment).

**Request Body:**
```json
{
  "subscription_id": 1,
  "razorpay_invoice_id": "inv_12345",
  "amount": 2999,
  "status": "issued"
}
```

**Response (201):**
```json
{
  "id": 1,
  "message": "Invoice created successfully"
}
```

---

### 10. Update Invoice Status
**PUT** `/subscriptions/invoices/:id` 🔒 (admin only)

Update invoice status.

**Request Body:**
```json
{
  "status": "paid"
}
```

**Response (200):**
```json
{
  "message": "Invoice status updated successfully"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Error description"
}
```

### Common Status Codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Authentication Roles

- **Admin**: Full access to all features
- **HR**: Can manage candidates, jobs, interviews
- **Recruiter**: Can add/view candidates, manage applications
- **User**: General team member with view access

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- All monetary amounts are in the currency specified (default: INR)
- Passwords must be at least 8 characters with uppercase, lowercase, and numbers
- Phone numbers are validated for 10 digits
- Skills are stored as JSON arrays

---

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Update database and JWT credentials

3. **Run database migration:**
   ```bash
   mysql -u root -p < src/database.sql
   ```

4. **Start server:**
   ```bash
   npm start
   ```

5. **For development with auto-reload:**
   ```bash
   npm run dev
   ```

---
