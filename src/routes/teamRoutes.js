const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const allow = require("../middleware/roleMiddleware");
const {
  getTeamMembers,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
  changePassword
} = require("../controllers/teamController");

// Get all team members (admin only)
router.get("/", auth, allow("admin"), getTeamMembers);

// Add team member (admin only)
router.post("/", auth, allow("admin"), addTeamMember);

// Update team member (admin only)
router.put("/:id", auth, allow("admin"), updateTeamMember);

// Remove team member (admin only)
router.delete("/:id", auth, allow("admin"), removeTeamMember);

// Change password (any authenticated user)
router.post("/change-password", auth, changePassword);

module.exports = router;
