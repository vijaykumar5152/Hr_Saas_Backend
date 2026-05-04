const db = require("../config/db");
const { validateSubscriptionInput } = require("../utils/validators");

// SUBSCRIPTION PLANS
const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: {
      max_jobs: 2,
      max_candidates: 20,
      max_team_members: 1,
      interview_scheduling: false,
      custom_notes: false,
      kanban_board: false
    }
  },
  basic: {
    name: 'Basic',
    price: 999,
    features: {
      max_jobs: 10,
      max_candidates: 100,
      max_team_members: 3,
      interview_scheduling: true,
      custom_notes: true,
      kanban_board: false
    }
  },
  professional: {
    name: 'Professional',
    price: 2999,
    features: {
      max_jobs: 50,
      max_candidates: 500,
      max_team_members: 10,
      interview_scheduling: true,
      custom_notes: true,
      kanban_board: true
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 5999,
    features: {
      max_jobs: 'unlimited',
      max_candidates: 'unlimited',
      max_team_members: 'unlimited',
      interview_scheduling: true,
      custom_notes: true,
      kanban_board: true
    }
  }
};

// GET SUBSCRIPTION PLANS
exports.getPlans = async (req, res) => {
  try {
    res.json(SUBSCRIPTION_PLANS);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET CURRENT SUBSCRIPTION
exports.getCurrentSubscription = async (req, res) => {
  try {
    const company_id = req.user.company_id || req.user.id;

    const [subscriptions] = await db.query(
      "SELECT * FROM subscriptions WHERE company_id = ? AND is_active = 1 ORDER BY start_date DESC LIMIT 1",
      [company_id]
    );

    if (subscriptions.length === 0) {
      return res.status(404).json({ message: "No active subscription found" });
    }

    const subscription = subscriptions[0];
    const plan = SUBSCRIPTION_PLANS[subscription.plan_type];

    res.json({
      ...subscription,
      plan_details: plan
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPGRADE SUBSCRIPTION
exports.upgradeSubscription = async (req, res) => {
  try {
    const company_id = req.user.company_id || req.user.id;
    const { plan_type, razorpay_subscription_id } = req.body;

    const errors = validateSubscriptionInput({ plan_type });
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0] });
    }

    const plan = SUBSCRIPTION_PLANS[plan_type];
    if (!plan) {
      return res.status(400).json({ message: "Invalid plan type" });
    }

    // Get current subscription
    const [currentSubs] = await db.query(
      "SELECT * FROM subscriptions WHERE company_id = ? AND is_active = 1",
      [company_id]
    );

    if (currentSubs.length > 0) {
      // Deactivate old subscription
      await db.query(
        "UPDATE subscriptions SET is_active = 0 WHERE id = ?",
        [currentSubs[0].id]
      );
    }

    // Create new subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const [result] = await db.query(
      "INSERT INTO subscriptions (company_id, plan_type, price, billing_cycle, razorpay_subscription_id, start_date, end_date, auto_renew, is_active) VALUES (?,?,?,?,?,?,?,?,?)",
      [company_id, plan_type, plan.price, 'monthly', razorpay_subscription_id || null, startDate, endDate, true, true]
    );

    // Update company subscription plan
    await db.query(
      "UPDATE companies SET subscription_plan = ? WHERE id = ?",
      [plan_type, company_id]
    );

    res.json({
      message: "Subscription upgraded successfully",
      subscription_id: result.insertId,
      plan_type,
      amount: plan.price,
      billing_cycle: 'monthly'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CANCEL SUBSCRIPTION
exports.cancelSubscription = async (req, res) => {
  try {
    const company_id = req.user.company_id || req.user.id;

    const [result] = await db.query(
      "UPDATE subscriptions SET is_active = 0, auto_renew = 0 WHERE company_id = ? AND is_active = 1",
      [company_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No active subscription found" });
    }

    // Downgrade to free plan
    await db.query(
      "UPDATE companies SET subscription_plan = 'free' WHERE id = ?",
      [company_id]
    );

    res.json({ message: "Subscription cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET BILLING HISTORY
exports.getBillingHistory = async (req, res) => {
  try {
    const company_id = req.user.company_id || req.user.id;

    const [subscriptions] = await db.query(
      "SELECT * FROM subscriptions WHERE company_id = ? ORDER BY start_date DESC",
      [company_id]
    );

    if (subscriptions.length === 0) {
      return res.status(404).json({ message: "No subscription history found" });
    }

    const subscription_ids = subscriptions.map(s => s.id);

    const [invoices] = await db.query(
      `SELECT * FROM invoices WHERE subscription_id IN (${subscription_ids.map(() => '?').join(',')}) ORDER BY issue_date DESC`,
      subscription_ids
    );

    res.json({
      subscriptions,
      invoices
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET INVOICES
exports.getInvoices = async (req, res) => {
  try {
    const company_id = req.user.company_id || req.user.id;
    const { status } = req.query;

    let query = `
      SELECT i.* FROM invoices i
      JOIN subscriptions s ON i.subscription_id = s.id
      WHERE s.company_id = ?
    `;
    let params = [company_id];

    if (status) {
      query += " AND i.status = ?";
      params.push(status);
    }

    query += " ORDER BY i.issue_date DESC";

    const [invoices] = await db.query(query, params);

    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET INVOICE BY ID
exports.getInvoiceById = async (req, res) => {
  try {
    const company_id = req.user.company_id || req.user.id;
    const { id } = req.params;

    const [invoices] = await db.query(
      `SELECT i.* FROM invoices i
       JOIN subscriptions s ON i.subscription_id = s.id
       WHERE i.id = ? AND s.company_id = ?`,
      [id, company_id]
    );

    if (invoices.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(invoices[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE INVOICE (Called after Razorpay payment)
exports.createInvoice = async (req, res) => {
  try {
    const company_id = req.user.company_id || req.user.id;
    const { subscription_id, razorpay_invoice_id, amount, status } = req.body;

    const [subscriptions] = await db.query(
      "SELECT * FROM subscriptions WHERE id = ? AND company_id = ?",
      [subscription_id, company_id]
    );

    if (subscriptions.length === 0) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const [result] = await db.query(
      "INSERT INTO invoices (subscription_id, razorpay_invoice_id, amount, currency, status, issue_date, due_date) VALUES (?,?,?,?,?,?,?)",
      [subscription_id, razorpay_invoice_id || null, amount || subscriptions[0].price, 'INR', status || 'issued', new Date(), dueDate]
    );

    res.json({
      id: result.insertId,
      message: "Invoice created successfully"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE INVOICE STATUS
exports.updateInvoiceStatus = async (req, res) => {
  try {
    const company_id = req.user.company_id || req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['issued', 'paid', 'pending', 'overdue', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const [result] = await db.query(
      `UPDATE invoices i
       SET i.status = ?
       WHERE i.id = ? AND i.subscription_id IN (
         SELECT id FROM subscriptions WHERE company_id = ?
       )`,
      [status, id, company_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Update paid_date if status is paid
    if (status === 'paid') {
      await db.query(
        `UPDATE invoices i
         SET i.paid_date = NOW()
         WHERE i.id = ?`,
        [id]
      );
    }

    res.json({ message: "Invoice status updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET SUBSCRIPTION FEATURES
exports.getSubscriptionFeatures = async (req, res) => {
  try {
    const company_id = req.user.company_id || req.user.id;

    const [subscriptions] = await db.query(
      "SELECT plan_type FROM subscriptions WHERE company_id = ? AND is_active = 1",
      [company_id]
    );

    if (subscriptions.length === 0) {
      return res.status(404).json({ message: "No active subscription found" });
    }

    const plan = SUBSCRIPTION_PLANS[subscriptions[0].plan_type];

    res.json(plan.features);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
