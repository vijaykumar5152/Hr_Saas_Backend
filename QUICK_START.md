# 🚀 Quick Start Guide

## Installation (5 minutes)

### 1. Install Dependencies
```bash
cd d:\Hr_SAAS\Backend\Server
npm install
```

### 2. Setup Database
```bash
# Run this command to create all tables
mysql -u root -p < src/database.sql
```

### 3. Configure Environment
```bash
# Copy template
copy .env.example .env

# Edit .env file with your settings
# Important fields:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hr_saas_db
JWT_SECRET=change_this_to_random_string
PORT=5000
```

### 4. Start Server
```bash
# Development with auto-reload
npm run dev

# Or production
npm start
```

Server runs on: `http://localhost:5000`

---

## First 5 API Calls to Test

### 1️⃣ Check Server Health
```bash
curl http://localhost:5000/api/health
```

### 2️⃣ Register Company
```bash
curl -X POST http://localhost:5000/api/auth/company/register \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "My Company",
    "email": "admin@mycompany.com",
    "password": "Password123!",
    "confirm_password": "Password123!"
  }'
```
**Response includes:** `token` (save this!)

### 3️⃣ Login Company
```bash
curl -X POST http://localhost:5000/api/auth/company/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mycompany.com",
    "password": "Password123!"
  }'
```

### 4️⃣ Get Dashboard Stats (use token from step 2)
```bash
curl http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5️⃣ Create a Job
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Frontend Developer",
    "department": "Engineering",
    "location": "New York, NY",
    "salary_min": 80000,
    "salary_max": 120000
  }'
```

---

## Features at a Glance

| Feature | Status | Key Endpoints |
|---------|--------|--------------|
| 👤 Authentication | ✅ | `/auth/company/*`, `/auth/*` |
| 📊 Dashboard | ✅ | `/dashboard/stats`, `/dashboard/detailed` |
| 💼 Jobs | ✅ | `/jobs` (CRUD) |
| 👥 Candidates | ✅ | `/candidates` (CRUD) |
| 📝 Notes & Ratings | ✅ | `/notes` (CRUD) |
| 📅 Interviews | ✅ | `/interviews` (CRUD) |
| 👨‍💼 Team Management | ✅ | `/team` (CRUD) |
| 💳 Subscriptions | ✅ | `/subscriptions` (plans, upgrade) |

---

## Project Structure

```
src/
├── app.js                      # Main app
├── config/db.js                # Database setup
├── controllers/                # Business logic (8 files)
├── routes/                     # API routes (8 files)
├── middleware/                 # Auth, roles, errors
├── utils/                      # Validators, token generator
└── database.sql                # Database schema

Documentation:
├── README.md                   # Full documentation
├── API_DOCUMENTATION.md        # Complete API reference
├── IMPLEMENTATION_SUMMARY.md   # Feature summary
└── QUICK_START.md             # This file
```

---

## Common Tasks

### Add a Team Member
```bash
curl -X POST http://localhost:5000/api/team \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "full_name": "John Doe",
    "email": "john@company.com",
    "role": "hr"
  }'
```

### Add a Candidate
```bash
curl -X POST http://localhost:5000/api/candidates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "5551234567",
    "job_id": 1,
    "experience_years": 5,
    "skills": ["React", "TypeScript"]
  }'
```

### Update Candidate Stage
```bash
curl -X PUT http://localhost:5000/api/candidates/1/stage \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "stage": "Interview",
    "status": "active"
  }'
```

### Schedule Interview
```bash
curl -X POST http://localhost:5000/api/interviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "candidate_id": 1,
    "job_id": 1,
    "scheduled_date": "2024-04-28T14:00:00Z",
    "interview_type": "technical"
  }'
```

### Add Note to Candidate
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "candidate_id": 1,
    "rating": 4.5,
    "note": "Great technical skills!",
    "tags": ["technical", "team-player"]
  }'
```

---

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hr_saas_db

# Authentication
JWT_SECRET=your_secret_key_here_min_32_chars

# Server
PORT=5000
NODE_ENV=development

# Optional: Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Optional: Razorpay (for payments)
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

---

## Validation Rules

### Passwords
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

### Phone
- Must be 10 digits

### Email
- Standard email format

### Ratings
- Must be between 0 and 5

---

## Error Handling

All errors follow this format:
```json
{
  "message": "Error description"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (no permission)
- `404` - Not found
- `500` - Server error

---

## Troubleshooting

### Port 5000 Already in Use
```bash
# Change port in .env
PORT=5001

# Or kill the process (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Database Connection Failed
```bash
# Check MySQL is running
# Verify credentials in .env
# Ensure database exists

# Try this command:
mysql -u root -p -e "SHOW DATABASES;"
```

### Token Expired
- Tokens expire after 7 days
- Users need to login again
- Implement refresh token mechanism if needed

### Invalid Token
- Make sure token is passed in Authorization header
- Format: `Authorization: Bearer TOKEN`
- Don't include "Bearer" in the token itself

---

## Next Steps

1. ✅ **Setup Backend** - Done!
2. 📱 **Build Frontend** - Create React/Vue app
3. 🔗 **Connect APIs** - Integrate frontend with backend
4. 🧪 **Test Workflows** - Test complete hiring pipeline
5. 📧 **Add Email** - Setup email notifications
6. 💾 **Deploy** - Deploy to production server
7. 🎯 **Launch** - Launch to users

---

## Documentation Links

- 📖 [Full README](./README.md)
- 📚 [Complete API Docs](./API_DOCUMENTATION.md)
- ✨ [Features Summary](./IMPLEMENTATION_SUMMARY.md)
- 📋 [Database Schema](./src/database.sql)

---

## Key Endpoints Summary

```
POST   /api/auth/company/register      - Register company
POST   /api/auth/company/login         - Login company
POST   /api/auth/register              - Register team member
POST   /api/auth/login                 - Login team member

GET    /api/dashboard/stats            - Get dashboard metrics
GET    /api/dashboard/detailed         - Get detailed dashboard

POST   /api/jobs                       - Create job
GET    /api/jobs                       - Get all jobs
GET    /api/jobs/:id                   - Get job details
PUT    /api/jobs/:id                   - Update job

POST   /api/candidates                 - Add candidate
GET    /api/candidates                 - Get candidates
PUT    /api/candidates/:id/stage       - Update candidate stage

POST   /api/interviews                 - Schedule interview
GET    /api/interviews                 - Get interviews
PUT    /api/interviews/:id/feedback    - Add feedback

POST   /api/notes                      - Add note
GET    /api/notes/candidate/:id        - Get candidate notes

GET    /api/team                       - Get team members
POST   /api/team                       - Add team member

GET    /api/subscriptions/plans        - Get subscription plans
GET    /api/subscriptions/current      - Get current subscription
POST   /api/subscriptions/upgrade      - Upgrade plan
```

---

## Tips & Best Practices

1. **Always include Authorization header** for protected endpoints
2. **Use proper HTTP methods**: GET (read), POST (create), PUT (update), DELETE (remove)
3. **Validate input** before sending to API
4. **Store tokens securely** in frontend (localStorage/sessionStorage)
5. **Handle errors gracefully** in frontend
6. **Use query parameters** for filtering: `GET /api/candidates?job_id=1&stage=Interview`
7. **Implement pagination** for large lists
8. **Cache dashboard stats** to reduce load
9. **Use request/response logging** for debugging
10. **Monitor token expiration** and auto-refresh

---

## Support

For detailed information, check:
- `README.md` - Full project documentation
- `API_DOCUMENTATION.md` - Complete API reference
- `IMPLEMENTATION_SUMMARY.md` - Features overview

---

**Happy Coding! 🎉**

Backend is ready for integration!
