const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const seedUsers = async () => {
  try {
    const adminPassword = await bcrypt.hash("Admin@123", 10);
    const salesPassword = await bcrypt.hash("Sales@123", 10);

    await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES
       ($1, $2, $3, $4),
       ($5, $6, $7, $8)
       ON CONFLICT (email) DO NOTHING`,
      [
        "Admin User",
        "admin@example.com",
        adminPassword,
        "ADMIN",
        "Sales User",
        "sales@example.com",
        salesPassword,
        "SALES_USER",
      ]
    );

    console.log("Users seeded successfully");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await pool.end();
  }
};

seedUsers();