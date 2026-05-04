// Input validation utilities
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
};

const validateJobInput = (data) => {
  const errors = [];
  
  if (!data.title || data.title.trim().length < 3) {
    errors.push('Job title must be at least 3 characters');
  }
  if (!data.department || data.department.trim().length === 0) {
    errors.push('Department is required');
  }
  if (!data.location || data.location.trim().length === 0) {
    errors.push('Location is required');
  }
  if (data.salary_min && data.salary_max && data.salary_min > data.salary_max) {
    errors.push('Minimum salary cannot be greater than maximum salary');
  }
  
  return errors;
};

const validateCandidateInput = (data) => {
  const errors = [];
  
  if (!data.full_name || data.full_name.trim().length < 2) {
    errors.push('Full name is required');
  }
  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email is required');
  }
  if (!data.phone || !validatePhone(data.phone)) {
    errors.push('Valid 10-digit phone number is required');
  }
  if (data.experience_years && (data.experience_years < 0 || data.experience_years > 70)) {
    errors.push('Experience years must be between 0 and 70');
  }
  
  return errors;
};

const validateInterviewInput = (data) => {
  const errors = [];
  
  if (!data.scheduled_date) {
    errors.push('Interview date is required');
  } else if (new Date(data.scheduled_date) < new Date()) {
    errors.push('Interview date cannot be in the past');
  }
  if (!data.interview_type) {
    errors.push('Interview type is required');
  }
  if (data.duration_minutes && (data.duration_minutes < 15 || data.duration_minutes > 480)) {
    errors.push('Duration must be between 15 and 480 minutes');
  }
  
  return errors;
};

const validateSubscriptionInput = (data) => {
  const errors = [];
  
  if (!data.plan_type) {
    errors.push('Plan type is required');
  }
  if (!['free', 'basic', 'professional', 'enterprise'].includes(data.plan_type)) {
    errors.push('Invalid plan type');
  }
  if (data.price && data.price < 0) {
    errors.push('Price cannot be negative');
  }
  
  return errors;
};

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
  validateJobInput,
  validateCandidateInput,
  validateInterviewInput,
  validateSubscriptionInput,
};
