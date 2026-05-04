const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { getDashboardStats, getDetailedDashboard } = require("../controllers/dashboardController");

// Get dashboard stats
router.get("/stats", auth, getDashboardStats);

// Get detailed dashboard info
router.get("/detailed", auth, getDetailedDashboard);

module.exports = router;
