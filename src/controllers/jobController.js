const db = require("../config/db");
const { validateJobInput } = require("../utils/validators");

// CREATE JOB
exports.createJob = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { title, department, location, salary_min, salary_max, description, requirements, status } = req.body;

    // Validate inputs
    const errors = validateJobInput({ title, department, location, salary_min, salary_max });
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0] });
    }

    const [result] = await db.query(
      "INSERT INTO jobs (company_id, title, department, location, salary_min, salary_max, description, requirements, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [company_id, title, department, location, salary_min || null, salary_max || null, description || null, requirements || null, status || 'open', req.user.id]
    );

    res.json({
      id: result.insertId,
      title,
      department,
      location,
      salary_min,
      salary_max,
      status: status || 'open'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL JOBS
exports.getJobs = async (req, res) => {
  try {
    const company_id = req.user.company_id;

    const [jobs] = await db.query(
      "SELECT j.*, u.full_name as created_by_name, COUNT(c.id) as applications_count FROM jobs j LEFT JOIN users u ON j.created_by = u.id LEFT JOIN candidates c ON j.id = c.job_id WHERE j.company_id = ? GROUP BY j.id ORDER BY j.created_at DESC",
      [company_id]
    );

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET SINGLE JOB
exports.getJobById = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { id } = req.params;

    const [jobs] = await db.query(
      "SELECT * FROM jobs WHERE id = ? AND company_id = ?",
      [id, company_id]
    );

    if (jobs.length === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(jobs[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE JOB
exports.updateJob = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { id } = req.params;
    const { title, department, location, salary_min, salary_max, description, requirements, status } = req.body;

    // Verify job exists
    const [jobs] = await db.query(
      "SELECT * FROM jobs WHERE id = ? AND company_id = ?",
      [id, company_id]
    );
    if (jobs.length === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    await db.query(
      "UPDATE jobs SET title = ?, department = ?, location = ?, salary_min = ?, salary_max = ?, description = ?, requirements = ?, status = ? WHERE id = ? AND company_id = ?",
      [title || jobs[0].title, department || jobs[0].department, location || jobs[0].location, salary_min !== undefined ? salary_min : jobs[0].salary_min, salary_max !== undefined ? salary_max : jobs[0].salary_max, description || jobs[0].description, requirements || jobs[0].requirements, status || jobs[0].status, id, company_id]
    );

    res.json({ message: "Job updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE/CLOSE JOB
exports.closeJob = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { id } = req.params;

    const [result] = await db.query(
      "UPDATE jobs SET status = 'closed' WHERE id = ? AND company_id = ?",
      [id, company_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ message: "Job closed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET JOB STATISTICS
exports.getJobStats = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { id } = req.params;

    const [jobs] = await db.query(
      "SELECT * FROM jobs WHERE id = ? AND company_id = ?",
      [id, company_id]
    );
    if (jobs.length === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    const [stats] = await db.query(
      "SELECT stage, COUNT(*) as count FROM candidates WHERE job_id = ? GROUP BY stage",
      [id]
    );

    const [totalApplications] = await db.query(
      "SELECT COUNT(*) as count FROM candidates WHERE job_id = ?",
      [id]
    );

    res.json({
      job: jobs[0],
      total_applications: totalApplications[0].count,
      stage_breakdown: stats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};