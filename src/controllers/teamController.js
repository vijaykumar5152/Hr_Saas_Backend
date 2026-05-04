const db = require("../config/db");
const bcrypt = require('bcryptjs');
const { validateEmail, validatePassword } = require("../utils/validators");

// GET ALL TEAM MEMBERS
exports.getTeamMembers = async (req, res) => {
  try {
    const company_id = req.user.company_id;

    const [users] = await db.query(
      "SELECT id, full_name, email, role, is_active, created_at FROM users WHERE company_id = ? ORDER BY created_at DESC",
      [company_id]
    );

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD TEAM MEMBER
exports.addTeamMember = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { full_name, email, role } = req.body;

    // Validation
    if (!full_name || full_name.trim().length < 2) {
      return res.status(400).json({ message: "Full name is required" });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }
    if (!['admin', 'hr', 'recruiter'].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be admin, hr, or recruiter" });
    }

    // Check if user already exists
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE email = ? AND company_id = ?",
      [email, company_id]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists for this company" });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const [result] = await db.query(
      "INSERT INTO users (company_id, full_name, email, password, role, is_active) VALUES (?,?,?,?,?,?)",
      [company_id, full_name, email, hashedPassword, role, true]
    );

    res.json({
      message: "Team member added successfully",
      user: {
        id: result.insertId,
        full_name,
        email,
        role,
        temporary_password: tempPassword,
        note: "Share this temporary password with the user. They should change it on first login."
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE TEAM MEMBER
exports.updateTeamMember = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { id } = req.params;
    const { full_name, role } = req.body;

    // Verify user belongs to company
    const [users] = await db.query(
      "SELECT * FROM users WHERE id = ? AND company_id = ?",
      [id, company_id]
    );
    if (users.length === 0) {
      return res.status(404).json({ message: "Team member not found" });
    }

    // Prevent changing own role if only admin
    if (id == req.user.id && role && role !== req.user.role) {
      const [adminCount] = await db.query(
        "SELECT COUNT(*) as count FROM users WHERE company_id = ? AND role = 'admin' AND id != ?",
        [company_id, id]
      );
      if (adminCount[0].count === 0) {
        return res.status(400).json({ message: "Cannot change role - you are the only admin" });
      }
    }

    await db.query(
      "UPDATE users SET full_name = ?, role = ? WHERE id = ? AND company_id = ?",
      [full_name || users[0].full_name, role || users[0].role, id, company_id]
    );

    res.json({ message: "Team member updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// REMOVE TEAM MEMBER
exports.removeTeamMember = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { id } = req.params;

    // Prevent self-removal
    if (id == req.user.id) {
      return res.status(400).json({ message: "Cannot remove yourself" });
    }

    // Verify user belongs to company
    const [users] = await db.query(
      "SELECT * FROM users WHERE id = ? AND company_id = ?",
      [id, company_id]
    );
    if (users.length === 0) {
      return res.status(404).json({ message: "Team member not found" });
    }

    // Prevent removing last admin
    if (users[0].role === 'admin') {
      const [adminCount] = await db.query(
        "SELECT COUNT(*) as count FROM users WHERE company_id = ? AND role = 'admin'",
        [company_id]
      );
      if (adminCount[0].count === 1) {
        return res.status(400).json({ message: "Cannot remove the only admin" });
      }
    }

    await db.query(
      "UPDATE users SET is_active = 0 WHERE id = ? AND company_id = ?",
      [id, company_id]
    );

    res.json({ message: "Team member removed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    if (!validatePassword(new_password)) {
      return res.status(400).json({ message: "Password must be at least 8 characters with uppercase, lowercase, and number" });
    }

    const [users] = await db.query(
      "SELECT password FROM users WHERE id = ?",
      [user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(current_password, users[0].password);
    if (!validPassword) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, user_id]
    );

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
