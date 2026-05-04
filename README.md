# HR Recruitment SaaS Backend

A comprehensive backend system for an HR Recruitment SaaS platform built with Node.js, Express, and MySQL.

## 📋 Features

### 1. **Company & User Management**
- Company registration and authentication
- Team member management with role-based access (Admin, HR, Recruiter)
- Secure password hashing with bcryptjs
- JWT token-based authentication

### 2. **Dashboard**
- Real-time analytics and metrics
- Open jobs count
- Total candidates tracking
- Interviews scheduled today
- Hired candidates this month
- Candidate stage breakdown

### 3. **Job Management**
- Create, read, update, and delete job postings
- Job fields: Title, Department, Location, Salary Range, Description
- Job status management (Open/Closed)
- Job-wise application statistics
- Support for multiple concurrent job postings

### 4. **Candidate Management**
- Add candidates with detailed information
- Fields: Name, Email, Phone, Experience, Skills, Resume URL
- Candidate stage tracking (Applied → Screening → Interview → Final Round → Selected/Rejected)
- Filter candidates by job, stage, or status
- Update candidate information
- Delete candidates

### 5. **Hiring Pipeline**
- 6 Pipeline Stages: Applied, Screening, Interview, Final Round, Selected, Rejected
- Move candidates through stages
- Track application status
- Stage-wise candidate breakdown

### 6. **Notes & Ratings**
- Add detailed notes about candidates
- Rate candidates (0-5 stars)
- Tag notes with custom tags
- View all notes for a candidate
- Calculate average candidate rating
- Edit and delete notes
- Export notes report

### 7. **Interview Scheduling**
- Schedule interviews with date and time
- Assign interviewers
- Set interview type (Screening, Technical, HR, Final)
- Video meeting link integration
- Add interview feedback
- Track interview status (Scheduled, Completed, Cancelled)
- Get today's interviews
- Get upcoming interviews (7 days by default)
- Cancel interviews

### 8. **Team Management**
- Add HR team members
- Assign roles (Admin, HR, Recruiter)
- Update team member information
- Deactivate team members
- Change password functionality
- Prevent last admin removal

### 9. **Subscription & Billing**
- Multiple subscription plans:
  - **Free**: 2 jobs, 20 candidates, 1 team member
  - **Basic** (₹999/month): 10 jobs, 100 candidates, 3 team members, Interview scheduling
  - **Professional** (₹2999/month): 50 jobs, 500 candidates, 10 team members, Kanban board
  - **Enterprise** (₹5999/month): Unlimited features
- Upgrade/downgrade subscriptions
- Razorpay integration ready
- Invoice management
- Billing history tracking
- Feature access control based on subscription

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Environment Variables**: dotenv
- **CORS**: cors
- **HTTP Client**: axios

## 📦 Project Structure

```
src/
├── app.js                    # Main application file
├── config/
│   └── db.js                # Database configuration
├── controllers/
│   ├── authController.js     # Company & User authentication
│   ├── dashboardController.js # Dashboard stats & metrics
│   ├── jobController.js      # Job management
│   ├── candidateController.js # Candidate management
│   ├── notesController.js    # Notes & ratings
│   ├── interviewController.js # Interview scheduling
│   ├── teamController.js     # Team member management
│   └── subscriptionController.js # Billing & subscriptions
├── routes/
│   ├── authRoutes.js
│   ├── dashboardRoutes.js
│   ├── jobRoutes.js
│   ├── candidateRoutes.js
│   ├── notesRoutes.js
│   ├── interviewRoutes.js
│   ├── teamRoutes.js
│   └── subscriptionRoutes.js
├── middleware/
│   ├── authMiddleware.js     # JWT verification
│   ├── roleMiddleware.js     # Role-based access control
│   └── errorMiddleware.js    # Global error handler
├── utils/
│   ├── generateToken.js      # JWT token generation
│   └── validators.js         # Input validation functions
└── database.sql              # Database schema

```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Hr_SAAS/Backend/Server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup database**
   ```bash
   # Create database and tables
   mysql -u root -p < src/database.sql
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=hr_saas_db
   JWT_SECRET=your_secret_key_here
   PORT=5000
   ```

5. **Start the server**
   ```bash
   # Production
   npm start
   
   # Development (with auto-reload)
   npm run dev
   ```

   Server will run on `http://localhost:5000`

## 📚 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Quick API Overview:

**Authentication:**
- `POST /api/auth/company/register` - Register company
- `POST /api/auth/company/login` - Login company
- `POST /api/auth/register` - Register team member
- `POST /api/auth/login` - Login team member

**Dashboard:**
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/detailed` - Get detailed dashboard

**Jobs:**
- `POST /api/jobs` - Create job
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job by ID
- `PUT /api/jobs/:id` - Update job
- `GET /api/jobs/:id/stats` - Get job statistics

**Candidates:**
- `POST /api/candidates` - Add candidate
- `GET /api/candidates` - Get all candidates
- `GET /api/candidates/:id` - Get candidate
- `PUT /api/candidates/:id` - Update candidate
- `PUT /api/candidates/:id/stage` - Update candidate stage

**Interviews:**
- `POST /api/interviews` - Schedule interview
- `GET /api/interviews` - Get interviews
- `GET /api/interviews/today` - Get today's interviews
- `PUT /api/interviews/:id/feedback` - Add feedback

**Subscriptions:**
- `GET /api/subscriptions/plans` - Get plans
- `GET /api/subscriptions/current` - Get current subscription
- `POST /api/subscriptions/upgrade` - Upgrade subscription

## 🔐 Authentication & Authorization

### JWT Tokens
All protected endpoints require Bearer token:
```
Authorization: Bearer <token>
```

### Role-Based Access Control
- **Admin**: Full access to all features
- **HR**: Can manage jobs, candidates, interviews
- **Recruiter**: Can add candidates, manage applications

### Access Patterns
```javascript
// Protected route example
router.post('/', auth, allow('admin', 'hr'), createJob);
```

## 💾 Database Schema

### Tables:
- `companies` - Company accounts
- `users` - Team members
- `jobs` - Job postings
- `candidates` - Candidate profiles
- `candidate_notes` - Notes & ratings
- `interview_schedules` - Interview records
- `subscriptions` - Subscription details
- `invoices` - Billing invoices

See `src/database.sql` for complete schema.

## ✅ Validation

All inputs are validated:
- Email format validation
- Phone number validation (10 digits)
- Password requirements (8+ chars, uppercase, lowercase, number)
- Job and candidate field validation
- Subscription plan validation

## 🛡️ Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ Input validation
- ✅ Error handling
- ✅ CORS protection
- ✅ Environment variables for sensitive data

## 📊 Subscription Plans

| Feature | Free | Basic | Professional | Enterprise |
|---------|------|-------|--------------|------------|
| Price | Free | ₹999/mo | ₹2999/mo | ₹5999/mo |
| Max Jobs | 2 | 10 | 50 | Unlimited |
| Max Candidates | 20 | 100 | 500 | Unlimited |
| Team Members | 1 | 3 | 10 | Unlimited |
| Interview Scheduling | ❌ | ✅ | ✅ | ✅ |
| Custom Notes | ❌ | ✅ | ✅ | ✅ |
| Kanban Board | ❌ | ❌ | ✅ | ✅ |

## 🚦 HTTP Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## 📝 Example Requests

### Company Registration
```bash
curl -X POST http://localhost:5000/api/auth/company/register \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Acme Corp",
    "email": "admin@acme.com",
    "password": "Password123!",
    "confirm_password": "Password123!"
  }'
```

### Add Candidate
```bash
curl -X POST http://localhost:5000/api/candidates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "5551234567",
    "job_id": 1,
    "experience_years": 5,
    "skills": ["React", "TypeScript"]
  }'
```

### Schedule Interview
```bash
curl -X POST http://localhost:5000/api/interviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "candidate_id": 1,
    "job_id": 1,
    "scheduled_date": "2024-04-28T14:00:00Z",
    "interview_type": "technical"
  }'
```

## 🔄 Workflow Example

1. **Company Registration** → Company admin signs up
2. **Add Team Members** → Admin adds HR team members
3. **Create Jobs** → Post job openings
4. **Add Candidates** → Recruiters add candidates
5. **Track Pipeline** → Move candidates through stages
6. **Schedule Interviews** → Plan interviews with candidates
7. **Add Notes & Ratings** → Document candidate feedback
8. **Track Metrics** → View dashboard statistics
9. **Manage Subscription** → Upgrade to advanced plans
10. **Generate Reports** → Export candidate notes

## 🐛 Troubleshooting

### Database Connection Error
```
Error: Connection refused
```
- Check MySQL is running
- Verify DB credentials in .env
- Ensure database exists

### Authentication Failed
```
Error: Invalid Token
```
- Check JWT_SECRET in .env
- Verify token is passed correctly
- Ensure token hasn't expired

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
- Change PORT in .env
- Or kill process: `lsof -i :5000` and `kill -9 <PID>`

## 📞 Support

For issues or questions, please refer to the API documentation or create an issue in the repository.

## 📄 License

This project is provided as-is for HR Recruitment SaaS platform development.

---

## 🎯 Next Steps

1. **Frontend Integration**: Connect with React/Vue.js frontend
2. **Email Integration**: Setup email notifications for interviews
3. **File Upload**: Implement resume upload to S3/Cloud Storage
4. **Razorpay Integration**: Complete payment processing
5. **Analytics**: Add advanced reporting features
6. **Notifications**: Setup real-time notifications
7. **Search**: Implement Elasticsearch for advanced candidate search
8. **Testing**: Add unit and integration tests

---

**Built with ❤️ for HR Recruitment**
