const db = require("../config/db");

// GET DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    
    if (!company_id) {
      return res.status(400).json({ message: "Invalid user context" });
    }

    // Get open jobs count
    const [jobsResult] = await db.query(
      "SELECT COUNT(*) as count FROM jobs WHERE company_id = ? AND status = 'open'",
      [company_id]
    );
    const open_jobs = jobsResult[0].count;

    // Get total candidates count
    const [candidatesResult] = await db.query(
      "SELECT COUNT(*) as count FROM candidates WHERE company_id = ?",
      [company_id]
    );
    const total_candidates = candidatesResult[0].count;

    // Get interviews today - filter by candidates.company_id instead of interview_schedules.company_id
    const [interviewsResult] = await db.query(
      "SELECT COUNT(*) as count FROM interview_schedules i JOIN candidates c ON i.candidate_id = c.id WHERE c.company_id = ? AND DATE(i.scheduled_date) = CURDATE()",
      [company_id]
    );
    const interviews_today = interviewsResult[0].count;

    // Get hired this month
    const [hiredResult] = await db.query(
      "SELECT COUNT(*) as count FROM candidates WHERE company_id = ? AND status = 'selected' AND MONTH(updated_at) = MONTH(CURDATE()) AND YEAR(updated_at) = YEAR(CURDATE())",
      [company_id]
    );
    const hired_this_month = hiredResult[0].count;

    // Get stage-wise breakdown
    const [stageBreakdown] = await db.query(
      "SELECT stage, COUNT(*) as count FROM candidates WHERE company_id = ? GROUP BY stage",
      [company_id]
    );

    res.json({
      open_jobs,
      total_candidates,
      interviews_today,
      hired_this_month,
      stage_breakdown: stageBreakdown,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET DETAILED DASHBOARD INFO
exports.getDetailedDashboard = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    
    if (!company_id) {
      return res.status(400).json({ message: "Invalid user context" });
    }

    // Get recent candidates
    const [recentCandidates] = await db.query(
      "SELECT c.id, c.full_name, c.email, c.stage, j.title as job_title, c.created_at FROM candidates c LEFT JOIN jobs j ON c.job_id = j.id WHERE c.company_id = ? ORDER BY c.created_at DESC LIMIT 5",
      [company_id]
    );

    // Get upcoming interviews - filter by candidates.company_id instead of interview_schedules.company_id
    const [upcomingInterviews] = await db.query(
      "SELECT i.id, i.scheduled_date, c.full_name as candidate_name, u.full_name as interviewer_name, j.title as job_title FROM interview_schedules i JOIN candidates c ON i.candidate_id = c.id JOIN jobs j ON i.job_id = j.id LEFT JOIN users u ON i.interviewer_id = u.id WHERE c.company_id = ? AND i.scheduled_date > NOW() ORDER BY i.scheduled_date ASC LIMIT 5",
      [company_id]
    );

    // Get top performers (candidates with highest ratings)
    const [topPerformers] = await db.query(
      "SELECT c.id, c.full_name, c.email, AVG(cn.rating) as avg_rating FROM candidates c LEFT JOIN candidate_notes cn ON c.id = cn.candidate_id WHERE c.company_id = ? AND c.status != 'rejected' GROUP BY c.id ORDER BY avg_rating DESC LIMIT 5",
      [company_id]
    );

    // Get job statistics
    const [jobStats] = await db.query(
      "SELECT j.title, COUNT(c.id) as applications FROM jobs j LEFT JOIN candidates c ON j.id = c.job_id WHERE j.company_id = ? GROUP BY j.id ORDER BY applications DESC LIMIT 5",
      [company_id]
    );

    res.json({
      recent_candidates: recentCandidates,
      upcoming_interviews: upcomingInterviews,
      top_performers: topPerformers,
      job_statistics: jobStats,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
