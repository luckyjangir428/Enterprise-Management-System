const pool = require("../config/db");

const createCustomer = async (req, res) => {
  try {
    const {
      companyName,
      contactPerson,
      mobile,
      email,
      city,
    } = req.body;

    if (!companyName || !contactPerson || !mobile || !city) {
      return res.status(400).json({
        message:
          "Company name, contact person, mobile and city are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO customers
       (company_name, contact_person, mobile, email, city)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        companyName,
        contactPerson,
        mobile,
        email || null,
        city,
      ]
    );

    res.status(201).json({
      message: "Customer created successfully",
      customer: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getCustomers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        company_name,
        contact_person,
        mobile,
        email,
        city,
        created_at
      FROM customers
      ORDER BY id DESC
    `);

    res.json({
      customers: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createCustomer,
    getCustomers,
};