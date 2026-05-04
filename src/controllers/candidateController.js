const db = require("../config/db");
const { validateCandidateInput } = require("../utils/validators");

// ADD CANDIDATE
exports.addCandidate = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { full_name, email, phone, job_id, stage, experience_years, skills, resume_url, source } = req.body;

    // Validate inputs
    const errors = validateCandidateInput({ full_name, email, phone, experience_years });
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0] });
    }

    // Check if candidate already exists for this job
    const [existingCandidate] = await db.query(
      "SELECT * FROM candidates WHERE company_id = ? AND email = ? AND job_id = ?",
      [company_id, email, job_id]
    );
    if (existingCandidate.length > 0) {
      return res.status(400).json({ message: "Candidate already exists for this job" });
    }

    const skillsJson = Array.isArray(skills) ? JSON.stringify(skills) : null;

    const [result] = await db.query(
      "INSERT INTO candidates (company_id, full_name, email, phone, job_id, stage, experience_years, skills, resume_url, source) VALUES (?,?,?,?,?,?,?,?,?,?)",
      [company_id, full_name, email, phone, job_id || null, stage || "Applied", experience_years || null, skillsJson, resume_url || null, source || 'manual']
    );

    res.json({
      id: result.insertId,
      full_name,
      email,
      phone,
      job_id,
      stage: stage || "Applied"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL CANDIDATES
exports.getCandidates = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { job_id, stage, status } = req.query;

    let query = "SELECT c.*, j.title as job_title FROM candidates c LEFT JOIN jobs j ON c.job_id = j.id WHERE c.company_id = ?";
    let params = [company_id];

    if (job_id) {
      query += " AND c.job_id = ?";
      params.push(job_id);
    }
    if (stage) {
      query += " AND c.stage = ?";
      params.push(stage);
    }
    if (status) {
      query += " AND c.status = ?";
      params.push(status);
    }

    query += " ORDER BY c.created_at DESC";

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET SINGLE CANDIDATE
exports.getCandidateById = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { id } = req.params;

    const [candidates] = await db.query(
      "SELECT * FROM candidates WHERE id = ? AND company_id = ?",
      [id, company_id]
    );

    if (candidates.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const candidate = candidates[0];
    if (candidate.skills) {
      candidate.skills = JSON.parse(candidate.skills);
    }

    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE CANDIDATE
exports.updateCandidate = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { id } = req.params;
    const { full_name, email, phone, experience_years, skills, resume_url } = req.body;

    const [candidates] = await db.query(
      "SELECT * FROM candidates WHERE id = ? AND company_id = ?",
      [id, company_id]
    );

    if (candidates.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const skillsJson = Array.isArray(skills) ? JSON.stringify(skills) : null;

    await db.query(
      "UPDATE candidates SET full_name = ?, email = ?, phone = ?, experience_years = ?, skills = ?, resume_url = ? WHERE id = ? AND company_id = ?",
      [full_name || candidates[0].full_name, email || candidates[0].email, phone || candidates[0].phone, experience_years !== undefined ? experience_years : candidates[0].experience_years, skillsJson || candidates[0].skills, resume_url || candidates[0].resume_url, id, company_id]
    );

    res.json({ message: "Candidate updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE CANDIDATE STAGE
exports.updateStage = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { id } = req.params;
    const { stage, status } = req.body;

    const validStages = ['Applied', 'Screening', 'Interview', 'Final Round', 'Selected', 'Rejected'];
    if (stage && !validStages.includes(stage)) {
      return res.status(400).json({ message: "Invalid stage" });
    }

    const validStatuses = ['active', 'rejected', 'selected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await db.query(
      "UPDATE candidates SET stage = ?, status = ? WHERE id = ? AND company_id = ?",
      [stage || null, status || null, id, company_id]
    );

    res.json({ message: "Candidate updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE CANDIDATE
exports.deleteCandidate = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM candidates WHERE id = ? AND company_id = ?",
      [id, company_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json({ message: "Candidate deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};