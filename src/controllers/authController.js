const db = require("../config/db");
const bcrypt = require('bcryptjs');
const generateToken = require("../utils/generateToken");
const { validateEmail, validatePassword } = require("../utils/validators");

// COMPANY REGISTRATION
exports.companyRegister = async(req, res) => {
    try {
        const { company_name, email, password, confirm_password, industry, website } = req.body;

        // Validate inputs
        if (!company_name || company_name.trim().length < 2) {
            return res.status(400).json({ message: "Company name is required" });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({ message: "Valid email is required" });
        }
        if (password !== confirm_password) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        if (!validatePassword(password)) {
            return res.status(400).json({ message: "Password must be at least 8 characters with uppercase, lowercase, and number" });
        }

        // Check if company already exists
        const [existingCompany] = await db.query("SELECT * FROM companies WHERE email = ?", [email]);
        if (existingCompany.length > 0) {
            return res.status(400).json({ message: "Company email already registered" });
        }

        // Hash password
        const hash = await bcrypt.hash(password, 10);
        
        // Create company
        const [result] = await db.query(
            "INSERT INTO companies (company_name, email, password, industry, website, subscription_plan) VALUES (?,?,?,?,?,?)",
            [company_name, email, hash, industry || null, website || null, 'free']
        );

        const company = {
            id: result.insertId,
            company_name,
            email,
            subscription_plan: 'free'
        };

        // Create default subscription for free plan
        await db.query(
            "INSERT INTO subscriptions (company_id, plan_type, price, billing_cycle) VALUES (?,?,?,?)",
            [result.insertId, 'free', 0, 'monthly']
        );

        res.json({
            message: "Company registered successfully",
            token: generateToken(company, 'company'),
            company: {
                id: company.id,
                name: company.company_name,
                email: company.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// COMPANY LOGIN
exports.companyLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!validateEmail(email)) {
            return res.status(400).json({ message: "Valid email is required" });
        }

        const [companies] = await db.query("SELECT * FROM companies WHERE email = ?", [email]);
        if (companies.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const company = companies[0];
        const validPassword = await bcrypt.compare(password, company.password);

        if (!validPassword) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (!company.is_active) {
            return res.status(403).json({ message: "Company account is disabled" });
        }

        const tokenData = {
            id: company.id,
            company_name: company.company_name,
            email: company.email,
            subscription_plan: company.subscription_plan,
            type: 'company'
        };

        res.json({
            message: "Login successful",
            token: generateToken(tokenData, 'company'),
            company: {
                id: company.id,
                name: company.company_name,
                email: company.email,
                subscription_plan: company.subscription_plan
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// USER REGISTRATION (Team Members)
exports.register = async(req, res) => {
    try {
        const { company_id, full_name, email, password, confirm_password, role } = req.body;

        // Validate inputs
        if (!full_name || full_name.trim().length < 2) {
            return res.status(400).json({ message: "Full name is required" });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({ message: "Valid email is required" });
        }
        if (password !== confirm_password) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        if (!validatePassword(password)) {
            return res.status(400).json({ message: "Password must be at least 8 characters with uppercase, lowercase, and number" });
        }

        const hash = await bcrypt.hash(password, 10);
        let finalCompanyId = company_id;

        // If no company_id provided, create a new company for this user
        if (!company_id) {
            // Check if email already exists as a user
            const [existingEmail] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
            if (existingEmail.length > 0) {
                return res.status(400).json({ message: "Email already registered" });
            }

            // Create a new company with the user's name (using a temporary password hash)
            const companyName = `${full_name}'s Company`;
            const companyEmail = `company_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@internal`;
            const tempHash = await bcrypt.hash('temp_company_password_' + Date.now(), 10);
            const [companyResult] = await db.query(
                "INSERT INTO companies (company_name, email, password, subscription_plan) VALUES (?,?,?,?)",
                [companyName, companyEmail, tempHash, 'free']
            );
            finalCompanyId = companyResult.insertId;

            // Create default subscription for free plan
            await db.query(
                "INSERT INTO subscriptions (company_id, plan_type, price, billing_cycle) VALUES (?,?,?,?)",
                [finalCompanyId, 'free', 0, 'monthly']
            );
        } else {
            // Check if company exists
            const [companies] = await db.query("SELECT * FROM companies WHERE id = ?", [finalCompanyId]);
            if (companies.length === 0) {
                return res.status(400).json({ message: "Company not found" });
            }

            // Check if user already exists for this company
            const [existingUser] = await db.query("SELECT * FROM users WHERE email = ? AND company_id = ?", [email, finalCompanyId]);
            if (existingUser.length > 0) {
                return res.status(400).json({ message: "User already exists for this company" });
            }
        }

        const [result] = await db.query(
            "INSERT INTO users (company_id, full_name, email, password, role) VALUES (?,?,?,?,?)",
            [finalCompanyId, full_name, email, hash, role || 'recruiter']
        );

        const user = {
            id: result.insertId,
            company_id: finalCompanyId,
            full_name,
            email,
            role: role || 'recruiter'
        };

        res.json({
            message: "User registered successfully",
            token: generateToken(user, 'user'),
            user: {
                id: user.id,
                name: user.full_name,
                email: user.email,
                role: user.role,
                company_id: user.company_id
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// USER LOGIN (Team Members)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!validateEmail(email)) {
        return res.status(400).json({ message: "Valid email is required" });
    }

    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: "User account is disabled" });
    }

    const tokenData = {
      id: user.id,
      company_id: user.company_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      type: 'user'
    };

    res.json({
      message: "Login successful",
      token: generateToken(tokenData, 'user'),
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        company_id: user.company_id
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET CURRENT USER
exports.getCurrentUser = async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, company_id, full_name, email, role, is_active, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET COMPANY INFO
exports.getCompanyInfo = async (req, res) => {
  try {
    const company_id = req.user.company_id || req.user.id;
    const [companies] = await db.query(
      "SELECT id, company_name, email, industry, website, subscription_plan, is_active, created_at FROM companies WHERE id = ?",
      [company_id]
    );

    if (companies.length === 0) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json(companies[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE COMPANY PROFILE
exports.updateCompanyProfile = async (req, res) => {
  try {
    const company_id = req.user.company_id || req.user.id;
    const { company_name, industry, website, employees_count } = req.body;

    await db.query(
      "UPDATE companies SET company_name = ?, industry = ?, website = ?, employees_count = ? WHERE id = ?",
      [company_name || null, industry || null, website || null, employees_count || null, company_id]
    );

    res.json({ message: "Company profile updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};