const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const allow = require("../middleware/roleMiddleware");
const {
  addNote,
  getNotesForCandidate,
  updateNote,
  deleteNote,
  getCandidateRating,
  exportNotesReport
} = require("../controllers/notesController");

// Export notes report
router.get("/export/report", auth, exportNotesReport);

// Add note
router.post("/", auth, allow("admin", "hr", "recruiter"), addNote);

// Get notes for candidate (must come before /:id)
router.get("/candidate/:candidate_id", auth, getNotesForCandidate);

// Get candidate rating
router.get("/candidate/:candidate_id/rating", auth, getCandidateRating);

// Update note
router.put("/:id", auth, updateNote);

// Delete note
router.delete("/:id", auth, deleteNote);

module.exports = router;
