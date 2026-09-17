const express = require("express");
const {
  createCustomer,
} = require("../controllers/customerController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "SALES_USER"),
  createCustomer
);

module.exports = router;