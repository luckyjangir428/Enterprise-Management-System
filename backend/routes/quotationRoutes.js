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
  authorizeRoles("ADMIN", "SALES_USER"),
  createQuotation
);

router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRoles("ADMIN", "SALES_USER"),
  updateQuotationStatus
);

router.post(
  "/:id/convert",
  authenticateToken,
  authorizeRoles("ADMIN", "SALES_USER"),
  convertQuotationToSalesOrder
);

router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "SALES_USER"),
  getQuotations
);
module.exports = router;