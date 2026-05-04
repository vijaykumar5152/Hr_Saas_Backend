const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const allow = require("../middleware/roleMiddleware");
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  closeJob,
  getJobStats
} = require("../controllers/jobController");

// Create job (admin, hr only)
router.post("/", auth, allow("admin", "hr"), createJob);

// Get all jobs
router.get("/", auth, getJobs);

// Get job statistics (must come before /:id to avoid conflict)
router.get("/:id/stats", auth, getJobStats);

// Get job by ID
router.get("/:id", auth, getJobById);

// Update job (admin, hr only)
router.put("/:id", auth, allow("admin", "hr"), updateJob);

// Close job (admin, hr only)
router.put("/:id/close", auth, allow("admin", "hr"), closeJob);

module.exports = router;