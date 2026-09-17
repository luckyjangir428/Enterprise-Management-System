const express = require("express");

const {
  createEnquiry,
  getEnquiries,
  getEnquiryById
} = require("../controllers/enquiryController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "USER"),
  createEnquiry
);

router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "USER"),
  getEnquiries
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "USER"),
  getEnquiryById
);

module.exports = router;