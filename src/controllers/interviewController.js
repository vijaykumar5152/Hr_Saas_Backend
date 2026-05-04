const db = require("../config/db");
const { validateInterviewInput } = require("../utils/validators");

// SCHEDULE INTERVIEW
exports.scheduleInterview = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { candidate_id, job_id, interviewer_id, scheduled_date, duration_minutes, interview_type, meet_link, notes } = req.body;

    // Validate
    const errors = validateInterviewInput({ scheduled_date, interview_type, duration_minutes });
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0] });
    }

    // Verify candidate exists
    const [candidates] = await db.query(
      "SELECT * FROM candidates WHERE id = ? AND company_id = ?",
      [candidate_id, company_id]
    );
    if (candidates.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Verify job exists
    const [jobs] = await db.query(
      "SELECT * FROM jobs WHERE id = ? AND company_id = ?",
      [job_id, company_id]
    );
    if (jobs.length === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    const [result] = await db.query(
      "INSERT INTO interview_schedules (candidate_id, job_id, company_id, interviewer_id, scheduled_date, duration_minutes, interview_type, meet_link, notes) VALUES (?,?,?,?,?,?,?,?,?)",
      [candidate_id, job_id, company_id, interviewer_id || null, scheduled_date, duration_minutes || 30, interview_type || 'screening', meet_link || null, notes || null]
    );

    res.json({
      id: result.insertId,
      candidate_id,
      job_id,
      scheduled_date,
      interview_type,
      message: "Interview scheduled successfully"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL INTERVIEWS
exports.getInterviews = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { candidate_id, job_id, status, date_from, date_to } = req.query;

    let query = `
      SELECT 
        i.*,
        c.full_name as candidate_name,
        c.email as candidate_email,
        j.title as job_title,
        u.full_name as interviewer_name
      FROM interview_schedules i
      JOIN candidates c ON i.candidate_id = c.id
      JOIN jobs j ON i.job_id = j.id
      LEFT JOIN users u ON i.interviewer_id = u.id
      WHERE i.company_id = ?
    `;
    let params = [company_id];

    if (candidate_id) {
      query += " AND i.candidate_id = ?";
      params.push(candidate_id);
    }
    if (job_id) {
      query += " AND i.job_id = ?";
      params.push(job_id);
    }
    if (status) {
      query += " AND i.status = ?";
      params.push(status);
    }
    if (date_from) {
      query += " AND DATE(i.scheduled_date) >= ?";
      params.push(date_from);
    }
    if (date_to) {
      query += " AND DATE(i.scheduled_date) <= ?";
      params.push(date_to);
    }

    query += " ORDER BY i.scheduled_date DESC";

    const [interviews] = await db.query(query, params);
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET INTERVIEW BY ID
exports.getInterviewById = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { id } = req.params;

    const [interviews] = await db.query(
      `SELECT i.*, c.full_name as candidate_name, j.title as job_title, u.full_name as interviewer_name
       FROM interview_schedules i
       JOIN candidates c ON i.candidate_id = c.id
       JOIN jobs j ON i.job_id = j.id
       LEFT JOIN users u ON i.interviewer_id = u.id
       WHERE i.id = ? AND i.company_id = ?`,
      [id, company_id]
    );

    if (interviews.length === 0) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.json(interviews[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE INTERVIEW
exports.updateInterview = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { id } = req.params;
    const { scheduled_date, interviewer_id, meet_link, notes, status } = req.body;

    // Verify interview exists
    const [interviews] = await db.query(
      "SELECT * FROM interview_schedules WHERE id = ? AND company_id = ?",
      [id, company_id]
    );
    if (interviews.length === 0) {
      return res.status(404).json({ message: "Interview not found" });
    }

    await db.query(
      "UPDATE interview_schedules SET scheduled_date = ?, interviewer_id = ?, meet_link = ?, notes = ?, status = ? WHERE id = ? AND company_id = ?",
      [scheduled_date || interviews[0].scheduled_date, interviewer_id !== undefined ? interviewer_id : interviews[0].interviewer_id, meet_link || interviews[0].meet_link, notes || interviews[0].notes, status || interviews[0].status, id, company_id]
    );

    res.json({ message: "Interview updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD INTERVIEW FEEDBACK
exports.addFeedback = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { id } = req.params;
    const { feedback, status } = req.body;

    if (!feedback || feedback.trim().length === 0) {
      return res.status(400).json({ message: "Feedback is required" });
    }

    const validStatuses = ['scheduled', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const [interviews] = await db.query(
      "SELECT * FROM interview_schedules WHERE id = ? AND company_id = ?",
      [id, company_id]
    );
    if (interviews.length === 0) {
      return res.status(404).json({ message: "Interview not found" });
    }

    await db.query(
      "UPDATE interview_schedules SET feedback = ?, status = ? WHERE id = ? AND company_id = ?",
      [feedback, status || 'completed', id, company_id]
    );

    res.json({ message: "Feedback added successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CANCEL INTERVIEW
exports.cancelInterview = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { id } = req.params;

    const [result] = await db.query(
      "UPDATE interview_schedules SET status = 'cancelled' WHERE id = ? AND company_id = ?",
      [id, company_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.json({ message: "Interview cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET TODAY'S INTERVIEWS
exports.getTodayInterviews = async (req, res) => {
  try {
    const company_id = req.user.company_id;

    const [interviews] = await db.query(
      `SELECT 
        i.*,
        c.full_name as candidate_name,
        c.email as candidate_email,
        j.title as job_title,
        u.full_name as interviewer_name
      FROM interview_schedules i
      JOIN candidates c ON i.candidate_id = c.id
      JOIN jobs j ON i.job_id = j.id
      LEFT JOIN users u ON i.interviewer_id = u.id
      WHERE i.company_id = ? AND DATE(i.scheduled_date) = CURDATE() AND i.status = 'scheduled'
      ORDER BY i.scheduled_date ASC`,
      [company_id]
    );

    res.json(interviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET UPCOMING INTERVIEWS
exports.getUpcomingInterviews = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { days = 7 } = req.query;

    const [interviews] = await db.query(
      `SELECT 
        i.*,
        c.full_name as candidate_name,
        c.email as candidate_email,
        j.title as job_title,
        u.full_name as interviewer_name
      FROM interview_schedules i
      JOIN candidates c ON i.candidate_id = c.id
      JOIN jobs j ON i.job_id = j.id
      LEFT JOIN users u ON i.interviewer_id = u.id
      WHERE i.company_id = ? AND DATE(i.scheduled_date) > CURDATE() AND DATE(i.scheduled_date) <= DATE_ADD(CURDATE(), INTERVAL ? DAY) AND i.status = 'scheduled'
      ORDER BY i.scheduled_date ASC`,
      [company_id, parseInt(days)]
    );

    res.json(interviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
