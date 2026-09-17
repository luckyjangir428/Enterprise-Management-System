const pool = require("../config/db");

const createEnquiry = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      enquiryNumber,
      customerId,
      enquiryDate,
      requiredDate,
      products,
      notes,
    } = req.body;

    if (
      !enquiryNumber ||
      !customerId ||
      !enquiryDate ||
      !requiredDate ||
      !products ||
      products.length === 0
    ) {
      return res.status(400).json({
        message:
          "Enquiry number, customer, enquiry date, required date and products are required",
      });
    }

    await client.query("BEGIN");

    const customerResult = await client.query(
      "SELECT id FROM customers WHERE id = $1",
      [customerId]
    );

    if (customerResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const enquiryResult = await client.query(
      `INSERT INTO enquiries
       (enquiry_number, customer_id, enquiry_date, required_date, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        enquiryNumber,
        customerId,
        enquiryDate,
        requiredDate,
        notes || null,
      ]
    );

    const enquiry = enquiryResult.rows[0];

    for (const product of products) {
      await client.query(
        `INSERT INTO enquiry_items
         (enquiry_id, product_id, quantity)
         VALUES ($1, $2, $3)`,
        [
          enquiry.id,
          product.productId,
          product.quantity,
        ]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Enquiry created successfully",
      enquiry,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  } finally {
    client.release();
  }
};


const getEnquiries = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        e.id,
        e.enquiry_number,
        e.enquiry_date,
        e.required_date,
        e.notes,
        e.status,
        c.company_name,
        c.contact_person,
        c.city
      FROM enquiries e
      JOIN customers c
        ON e.customer_id = c.id
      ORDER BY e.id DESC
    `);

    res.json({
      enquiries: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


const getEnquiryById = async (req, res) => {
  try {
    const enquiryId = req.params.id;

    const enquiryResult = await pool.query(
      `
      SELECT
        e.id,
        e.enquiry_number,
        e.enquiry_date,
        e.required_date,
        e.notes,
        e.status,
        c.id AS customer_id,
        c.company_name,
        c.contact_person,
        c.mobile,
        c.email,
        c.city
      FROM enquiries e
      JOIN customers c
        ON e.customer_id = c.id
      WHERE e.id = $1
      `,
      [enquiryId]
    );

    if (enquiryResult.rows.length === 0) {
      return res.status(404).json({
        message: "Enquiry not found",
      });
    }

    const itemsResult = await pool.query(
      `
      SELECT
        ei.product_id,
        p.product_code,
        p.product_name,
        p.category,
        p.unit,
        ei.quantity
      FROM enquiry_items ei
      JOIN products p
        ON ei.product_id = p.id
      WHERE ei.enquiry_id = $1
      ORDER BY ei.id
      `,
      [enquiryId]
    );

    res.json({
      enquiry: enquiryResult.rows[0],
      products: itemsResult.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


module.exports = {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
};