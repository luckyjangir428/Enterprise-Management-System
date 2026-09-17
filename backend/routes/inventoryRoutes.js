const express = require("express");

const {
  getInventory,
    getInventoryByProduct,
} = require("../controllers/inventoryController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "USER"),
  getInventory
);

router.get(
  "/product/:productId",
  authenticateToken,
  authorizeRoles("ADMIN", "USER"),
  getInventoryByProduct
);
module.exports = router;