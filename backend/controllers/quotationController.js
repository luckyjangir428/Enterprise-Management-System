const pool = require("../config/db");
const {
  calculateQuotationItem,
} = require("../utils/quotationCalculator");

const createQuotation = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      quotationNumber,
      enquiryId,
      validUntil,
      products,
    } = req.body;

    if (
      !quotationNumber ||
      !enquiryId ||
      !validUntil ||
      !products ||
      products.length === 0
    ) {
      return res.status(400).json({
        message:
          "Quotation number, enquiry, valid until and products are required",
      });
    }

    await client.query("BEGIN");

    const enquiryResult = await client.query(
      `SELECT *
       FROM enquiries
       WHERE id = $1`,
      [enquiryId]
    );

    if (enquiryResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Enquiry not found",
      });
    }

    const enquiry = enquiryResult.rows[0];

    if (enquiry.status !== "NEW") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Quotation can only be created for a NEW enquiry",
      });
    }

    const quotationResult = await client.query(
      `INSERT INTO quotations
       (quotation_number, enquiry_id, valid_until)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        quotationNumber,
        enquiryId,
        validUntil,
      ]
    );

    const quotation = quotationResult.rows[0];

    let grandTotal = 0;

    for (const product of products) {
      const calculation = calculateQuotationItem({
        quantity: product.quantity,
        unitPrice: product.unitPrice,
        discountPercent: product.discountPercent || 0,
        gstPercent: product.gstPercent || 0,
      });

      grandTotal += calculation.lineAmount;

      await client.query(
        `INSERT INTO quotation_items
         (
           quotation_id,
           product_id,
           quantity,
           unit_price,
           discount_percent,
           gst_percent
         )
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          quotation.id,
          product.productId,
          product.quantity,
          product.unitPrice,
          product.discountPercent || 0,
          product.gstPercent || 0,
        ]
      );
    }

    await client.query(
      `UPDATE enquiries
       SET status = 'QUOTED'
       WHERE id = $1`,
      [enquiryId]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Quotation created successfully",
      quotation: {
        ...quotation,
        grand_total: Number(grandTotal.toFixed(2)),
      },
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

const updateQuotationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const quotationId = req.params.id;

    const allowedStatuses = [
      "DRAFT",
      "SENT",
      "ACCEPTED",
      "REJECTED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid quotation status",
      });
    }

    const result = await pool.query(
      `UPDATE quotations
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, quotationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Quotation not found",
      });
    }

    res.json({
      message: "Quotation status updated successfully",
      quotation: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const convertQuotationToSalesOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const quotationId = req.params.id;
    const { orderNumber } = req.body;

    if (!orderNumber) {
      return res.status(400).json({
        message: "Order number is required",
      });
    }

    await client.query("BEGIN");

    // Check quotation
    const quotationResult = await client.query(
      `SELECT *
       FROM quotations
       WHERE id = $1
       FOR UPDATE`,
      [quotationId]
    );

    if (quotationResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Quotation not found",
      });
    }

    const quotation = quotationResult.rows[0];

    // Only ACCEPTED quotations can become Sales Orders
    if (quotation.status !== "ACCEPTED") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message:
          "Only accepted quotations can be converted to a Sales Order",
      });
    }

    // Check whether this quotation already has an order
    const existingOrder = await client.query(
      `SELECT id, order_number
       FROM sales_orders
       WHERE quotation_id = $1`,
      [quotationId]
    );

    if (existingOrder.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        message: "This quotation has already been converted to a Sales Order",
        salesOrder: existingOrder.rows[0],
      });
    }

    // Get customer through enquiry
    const customerResult = await client.query(
      `SELECT customer_id
       FROM enquiries
       WHERE id = $1`,
      [quotation.enquiry_id]
    );

    if (customerResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Customer information not found",
      });
    }

    const customerId = customerResult.rows[0].customer_id;

    // Calculate quotation total from database items
    const itemsResult = await client.query(
      `SELECT
         quantity,
         unit_price,
         discount_percent,
         gst_percent,
         product_id
       FROM quotation_items
       WHERE quotation_id = $1`,
      [quotationId]
    );

    let totalAmount = 0;

    for (const item of itemsResult.rows) {
      const calculation = calculateQuotationItem({
        quantity: Number(item.quantity),
        unitPrice: Number(item.unit_price),
        discountPercent: Number(item.discount_percent),
        gstPercent: Number(item.gst_percent),
      });

      totalAmount += calculation.lineAmount;
    }

    // Create Sales Order
    const orderResult = await client.query(
      `INSERT INTO sales_orders
       (
         order_number,
         quotation_id,
         customer_id,
         total_amount
       )
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        orderNumber,
        quotationId,
        customerId,
        totalAmount.toFixed(2),
      ]
    );

    const salesOrder = orderResult.rows[0];

    // Copy quotation products into Sales Order
    for (const item of itemsResult.rows) {
      await client.query(
        `INSERT INTO sales_order_items
         (
           sales_order_id,
           product_id,
           quantity,
           unit_price
         )
         VALUES ($1, $2, $3, $4)`,
        [
          salesOrder.id,
          item.product_id,
          item.quantity,
          item.unit_price,
        ]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Quotation converted to Sales Order successfully",
      salesOrder,
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

const getQuotations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        q.id,
        q.quotation_number,
        q.quotation_date,
        q.valid_until,
        q.status,
        e.enquiry_number,
        c.company_name
      FROM quotations q
      JOIN enquiries e
        ON q.enquiry_id = e.id
      JOIN customers c
        ON e.customer_id = c.id
      ORDER BY q.id DESC
    `);

    res.json({
      quotations: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createQuotation,
    updateQuotationStatus,
    convertQuotationToSalesOrder,
    getQuotations,
};