const express = require("express");

const {
  createEnquiry,
  getEnquiries,
} = require("../controllers/enquiryController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "SALES_USER"),
  createEnquiry
);

router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "SALES_USER"),
  getEnquiries
);

module.exports = router;