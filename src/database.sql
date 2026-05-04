-- HR Recruitment SaaS Database Schema

-- COMPANIES TABLE
CREATE TABLE IF NOT EXISTS companies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_name VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  website VARCHAR(255),
  employees_count INT,
  subscription_plan VARCHAR(50) DEFAULT 'free',
  subscription_start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  subscription_end_date DATETIME,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- USERS TABLE (HR Team Members)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'hr', 'recruiter') DEFAULT 'recruiter',
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE KEY unique_email_per_company (email, company_id)
);

-- JOBS TABLE
CREATE TABLE IF NOT EXISTS jobs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  salary_min INT,
  salary_max INT,
  location VARCHAR(255),
  status ENUM('open', 'closed') DEFAULT 'open',
  description TEXT,
  requirements TEXT,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- CANDIDATES TABLE
CREATE TABLE IF NOT EXISTS candidates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  job_id INT,
  stage ENUM('Applied', 'Screening', 'Interview', 'Final Round', 'Selected', 'Rejected') DEFAULT 'Applied',
  experience_years INT,
  skills JSON,
  resume_url VARCHAR(500),
  source VARCHAR(100),
  status ENUM('active', 'rejected', 'selected') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
);

-- CANDIDATE NOTES & RATINGS TABLE
CREATE TABLE IF NOT EXISTS candidate_notes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  candidate_id INT NOT NULL,
  user_id INT NOT NULL,
  rating DECIMAL(2, 1) CHECK (rating >= 0 AND rating <= 5),
  note TEXT NOT NULL,
  tags JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- INTERVIEW SCHEDULE TABLE
CREATE TABLE IF NOT EXISTS interview_schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  candidate_id INT NOT NULL,
  job_id INT NOT NULL,
  interviewer_id INT,
  scheduled_date DATETIME NOT NULL,
  duration_minutes INT DEFAULT 30,
  interview_type ENUM('screening', 'technical', 'hr', 'final') DEFAULT 'screening',
  meet_link VARCHAR(500),
  notes TEXT,
  feedback TEXT,
  status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (interviewer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  plan_type ENUM('free', 'basic', 'professional', 'enterprise') DEFAULT 'free',
  price DECIMAL(10, 2),
  billing_cycle VARCHAR(20),
  razorpay_subscription_id VARCHAR(255),
  start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  end_date DATETIME,
  auto_renew BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- BILLING INVOICES TABLE
CREATE TABLE IF NOT EXISTS invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  subscription_id INT NOT NULL,
  razorpay_invoice_id VARCHAR(255),
  amount DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'INR',
  status ENUM('issued', 'paid', 'pending', 'overdue', 'cancelled') DEFAULT 'pending',
  issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  due_date DATETIME,
  paid_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

-- TEAM USERS TABLE (already managed by users table with role-based access)
-- Adding additional permissions table for granular control
CREATE TABLE IF NOT EXISTS user_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  permission VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_permission (user_id, permission)
);

-- DASHBOARD STATS VIEW (helper table for dashboard metrics)
CREATE TABLE IF NOT EXISTS dashboard_stats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  open_jobs_count INT DEFAULT 0,
  total_candidates INT DEFAULT 0,
  interviews_today INT DEFAULT 0,
  hired_this_month INT DEFAULT 0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_company_users ON users(company_id);
CREATE INDEX idx_company_jobs ON jobs(company_id);
CREATE INDEX idx_company_candidates ON candidates(company_id);
CREATE INDEX idx_candidate_job ON candidates(job_id);
CREATE INDEX idx_interview_candidate ON interview_schedules(candidate_id);
CREATE INDEX idx_notes_candidate ON candidate_notes(candidate_id);
CREATE INDEX idx_subscriptions_company ON subscriptions(company_id);
CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);
