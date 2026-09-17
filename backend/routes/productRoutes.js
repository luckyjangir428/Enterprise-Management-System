const express = require("express");

const {
  getProducts,
} = require("../controllers/productController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "USER"),
  getProducts
);

module.exports = router;