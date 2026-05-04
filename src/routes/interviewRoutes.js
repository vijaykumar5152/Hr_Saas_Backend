const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const allow = require("../middleware/roleMiddleware");
const {
  scheduleInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  addFeedback,
  cancelInterview,
  getTodayInterviews,
  getUpcomingInterviews
} = require("../controllers/interviewController");

// Get today's interviews
router.get("/today", auth, getTodayInterviews);

// Get upcoming interviews
router.get("/upcoming", auth, getUpcomingInterviews);

// Get all interviews
router.get("/", auth, getInterviews);

// Get interview by ID (must come after specific routes)
router.get("/:id", auth, getInterviewById);

// Schedule interview
router.post("/", auth, allow("admin", "hr"), scheduleInterview);

// Update interview
router.put("/:id", auth, allow("admin", "hr"), updateInterview);

// Add feedback
router.put("/:id/feedback", auth, allow("admin", "hr"), addFeedback);

// Cancel interview
router.put("/:id/cancel", auth, allow("admin", "hr"), cancelInterview);

module.exports = router;
