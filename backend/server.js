const express = require("express");
const pool = require("./config/db");
const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const customerRoutes = require("./routes/customerRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const quotationRoutes = require("./routes/quotationRoutes");
const salesOrderRoutes = require("./routes/salesOrderRoutes");

const app = express();
app.use(express.json());


app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/sales-orders", salesOrderRoutes);

const PORT = process.env.PORT || 5000;

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Database connected successfully",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});