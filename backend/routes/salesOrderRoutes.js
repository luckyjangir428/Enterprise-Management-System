const express = require("express");

const {
  getSalesOrders,
  confirmSalesOrder,
    dispatchSalesOrder,
    getSalesOrderById,
    cancelSalesOrder
} = require("../controllers/salesOrderController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "SALES_USER"),
  getSalesOrders

);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "SALES_USER"),
  getSalesOrderById
);

router.post(
  "/:id/confirm",
  authenticateToken,
  authorizeRoles("ADMIN"),
  confirmSalesOrder
);

router.post(
  "/:id/dispatch",
  authenticateToken,
  authorizeRoles("ADMIN"),
  dispatchSalesOrder
);

router.post(
  "/:id/cancel",
  authenticateToken,
  authorizeRoles("ADMIN"),
  cancelSalesOrder
);



module.exports = router;