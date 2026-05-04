const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const allow = require("../middleware/roleMiddleware");
const {
  getPlans,
  getCurrentSubscription,
  upgradeSubscription,
  cancelSubscription,
  getBillingHistory,
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoiceStatus,
  getSubscriptionFeatures
} = require("../controllers/subscriptionController");

// Get all plans (no auth needed)
router.get("/plans", getPlans);

// Get current subscription
router.get("/current", auth, getCurrentSubscription);

// Get subscription features
router.get("/features", auth, getSubscriptionFeatures);

// Get billing history
router.get("/billing/history", auth, getBillingHistory);

// Get all invoices
router.get("/invoices", auth, getInvoices);

// Create invoice
router.post("/invoices", auth, allow("admin"), createInvoice);

// Get invoice by ID (must come after specific routes)
router.get("/invoices/:id", auth, getInvoiceById);

// Update invoice status
router.put("/invoices/:id", auth, allow("admin"), updateInvoiceStatus);

// Upgrade subscription
router.post("/upgrade", auth, allow("admin"), upgradeSubscription);

// Cancel subscription
router.post("/cancel", auth, allow("admin"), cancelSubscription);

module.exports = router;
