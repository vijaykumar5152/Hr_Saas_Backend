const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const allow = require("../middleware/roleMiddleware");
const {
  addCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  updateStage,
  deleteCandidate
} = require("../controllers/candidateController");

// Get all candidates
router.get("/", auth, getCandidates);

// Get candidate by ID
router.get("/:id", auth, getCandidateById);

// Add candidate (admin, hr, recruiter)
router.post("/", auth, allow("admin", "hr", "recruiter"), addCandidate);

// Update candidate (admin, hr, recruiter)
router.put("/:id", auth, allow("admin", "hr", "recruiter"), updateCandidate);

// Update candidate stage/status (admin, hr, recruiter)
router.put("/:id/stage", auth, allow("admin", "hr", "recruiter"), updateStage);

// Delete candidate (admin only)
router.delete("/:id", auth, allow("admin"), deleteCandidate);

module.exports = router;