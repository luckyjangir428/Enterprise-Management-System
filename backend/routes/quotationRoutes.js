const express = require("express");

const {
  createQuotation,
    updateQuotationStatus,
    convertQuotationToSalesOrder,
    getQuotations,
} = require("../controllers/quotationController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "USER"),
  createQuotation
);

router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRoles("ADMIN", "USER"),
  updateQuotationStatus
);

router.post(
  "/:id/convert",
  authenticateToken,
  authorizeRoles("ADMIN", "USER"),
  convertQuotationToSalesOrder
);

router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "USER"),
  getQuotations
);
module.exports = router;