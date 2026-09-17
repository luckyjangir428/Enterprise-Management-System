const pool = require("../config/db");

const getSalesOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        so.id,
        so.order_number,
        so.order_date,
        so.total_amount,
        so.status,
        c.company_name,
        q.quotation_number
      FROM sales_orders so
      JOIN customers c
        ON so.customer_id = c.id
      JOIN quotations q
        ON so.quotation_id = q.id
      ORDER BY so.id DESC
    `);

    res.json({
      salesOrders: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const confirmSalesOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const salesOrderId = req.params.id;

    await client.query("BEGIN");

    const orderResult = await client.query(
      `SELECT *
       FROM sales_orders
       WHERE id = $1
       FOR UPDATE`,
      [salesOrderId]
    );

    if (orderResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Sales Order not found",
      });
    }

    const salesOrder = orderResult.rows[0];

    if (salesOrder.status !== "PENDING") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Only pending Sales Orders can be confirmed",
      });
    }

    const itemsResult = await client.query(
      `SELECT
         soi.product_id,
         soi.quantity,
         p.product_name
       FROM sales_order_items soi
       JOIN products p
         ON soi.product_id = p.id
       WHERE soi.sales_order_id = $1`,
      [salesOrderId]
    );

    for (const item of itemsResult.rows) {
      const inventoryResult = await client.query(
        `SELECT *
         FROM inventory
         WHERE product_id = $1
         FOR UPDATE`,
        [item.product_id]
      );

      if (inventoryResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          message: `Inventory not found for ${item.product_name}`,
        });
      }

      const inventory = inventoryResult.rows[0];

      const available =
        inventory.physical_quantity -
        inventory.reserved_quantity;

      if (available < item.quantity) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message: `Insufficient stock for ${item.product_name}`,
          available,
          requested: item.quantity,
        });
      }
    }

    for (const item of itemsResult.rows) {
      await client.query(
        `UPDATE inventory
         SET reserved_quantity = reserved_quantity + $1
         WHERE product_id = $2`,
        [item.quantity, item.product_id]
      );
    }

    const updatedOrder = await client.query(
      `UPDATE sales_orders
       SET status = 'CONFIRMED'
       WHERE id = $1
       RETURNING *`,
      [salesOrderId]
    );

    await client.query("COMMIT");

    res.json({
      message: "Sales Order confirmed and inventory reserved",
      salesOrder: updatedOrder.rows[0],
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

const dispatchSalesOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const salesOrderId = req.params.id;

    const {
      dispatchNumber,
      vehicleNumber,
      driverName,
    } = req.body;

    if (!dispatchNumber || !vehicleNumber || !driverName) {
      return res.status(400).json({
        message:
          "Dispatch number, vehicle number and driver name are required",
      });
    }

    await client.query("BEGIN");

    const orderResult = await client.query(
      `SELECT *
       FROM sales_orders
       WHERE id = $1
       FOR UPDATE`,
      [salesOrderId]
    );

    if (orderResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Sales Order not found",
      });
    }

    const salesOrder = orderResult.rows[0];

    if (salesOrder.status !== "CONFIRMED") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message:
          "Only confirmed Sales Orders can be dispatched",
      });
    }

    const existingDispatch = await client.query(
      `SELECT id
       FROM dispatches
       WHERE sales_order_id = $1`,
      [salesOrderId]
    );

    if (existingDispatch.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        message: "Sales Order has already been dispatched",
      });
    }

    const itemsResult = await client.query(
      `SELECT
         soi.product_id,
         soi.quantity,
         p.product_name
       FROM sales_order_items soi
       JOIN products p
         ON soi.product_id = p.id
       WHERE soi.sales_order_id = $1`,
      [salesOrderId]
    );

    for (const item of itemsResult.rows) {
      const inventoryResult = await client.query(
        `SELECT *
         FROM inventory
         WHERE product_id = $1
         FOR UPDATE`,
        [item.product_id]
      );

      if (inventoryResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          message: `Inventory not found for ${item.product_name}`,
        });
      }

      const inventory = inventoryResult.rows[0];

      if (inventory.reserved_quantity < item.quantity) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message:
            `Cannot dispatch ${item.product_name}. ` +
            `Reserved quantity is insufficient.`,
          reserved: inventory.reserved_quantity,
          requested: item.quantity,
        });
      }
    }

    for (const item of itemsResult.rows) {
      await client.query(
        `UPDATE inventory
         SET
           physical_quantity = physical_quantity - $1,
           reserved_quantity = reserved_quantity - $1
         WHERE product_id = $2`,
        [item.quantity, item.product_id]
      );
    }

    const dispatchResult = await client.query(
      `INSERT INTO dispatches
       (
         dispatch_number,
         sales_order_id,
         vehicle_number,
         driver_name
       )
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        dispatchNumber,
        salesOrderId,
        vehicleNumber,
        driverName,
      ]
    );

    const updatedOrder = await client.query(
      `UPDATE sales_orders
       SET status = 'DISPATCHED'
       WHERE id = $1
       RETURNING *`,
      [salesOrderId]
    );

    await client.query("COMMIT");

    res.json({
      message: "Sales Order dispatched successfully",
      salesOrder: updatedOrder.rows[0],
      dispatch: dispatchResult.rows[0],
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

const getSalesOrderById = async (req, res) => {
  try {
    const salesOrderId = req.params.id;

    const orderResult = await pool.query(
      `
      SELECT
        so.id,
        so.order_number,
        so.order_date,
        so.total_amount,
        so.status,
        c.id AS customer_id,
        c.company_name,
        c.contact_person,
        c.mobile,
        c.email,
        c.city,
        q.id AS quotation_id,
        q.quotation_number,
        e.id AS enquiry_id,
        e.enquiry_number
      FROM sales_orders so
      JOIN customers c
        ON so.customer_id = c.id
      JOIN quotations q
        ON so.quotation_id = q.id
      JOIN enquiries e
        ON q.enquiry_id = e.id
      WHERE so.id = $1
      `,
      [salesOrderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        message: "Sales Order not found",
      });
    }

    const itemsResult = await pool.query(
      `
      SELECT
        soi.product_id,
        p.product_code,
        p.product_name,
        p.category,
        p.unit,
        soi.quantity,
        soi.unit_price
      FROM sales_order_items soi
      JOIN products p
        ON soi.product_id = p.id
      WHERE soi.sales_order_id = $1
      ORDER BY soi.id
      `,
      [salesOrderId]
    );

    res.json({
      salesOrder: orderResult.rows[0],
      products: itemsResult.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const cancelSalesOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const salesOrderId = req.params.id;

    await client.query("BEGIN");

    const orderResult = await client.query(
      `SELECT *
       FROM sales_orders
       WHERE id = $1
       FOR UPDATE`,
      [salesOrderId]
    );

    if (orderResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Sales Order not found",
      });
    }

    const salesOrder = orderResult.rows[0];

    if (salesOrder.status === "CANCELLED") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Sales Order is already cancelled",
      });
    }

    if (salesOrder.status === "DISPATCHED") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Dispatched Sales Orders cannot be cancelled",
      });
    }

    const itemsResult = await client.query(
      `SELECT
         product_id,
         quantity
       FROM sales_order_items
       WHERE sales_order_id = $1`,
      [salesOrderId]
    );

    // Release reserved inventory
    if (salesOrder.status === "CONFIRMED") {
      for (const item of itemsResult.rows) {
        const inventoryResult = await client.query(
          `SELECT *
           FROM inventory
           WHERE product_id = $1
           FOR UPDATE`,
          [item.product_id]
        );

        if (inventoryResult.rows.length === 0) {
          await client.query("ROLLBACK");

          return res.status(404).json({
            message: "Inventory not found",
          });
        }

        const inventory = inventoryResult.rows[0];

        if (inventory.reserved_quantity < item.quantity) {
          await client.query("ROLLBACK");

          return res.status(400).json({
            message:
              "Reserved inventory is less than the order quantity",
          });
        }
      }

      for (const item of itemsResult.rows) {
        await client.query(
          `UPDATE inventory
           SET reserved_quantity = reserved_quantity - $1
           WHERE product_id = $2`,
          [item.quantity, item.product_id]
        );
      }
    }

    const updatedOrder = await client.query(
      `UPDATE sales_orders
       SET status = 'CANCELLED'
       WHERE id = $1
       RETURNING *`,
      [salesOrderId]
    );

    await client.query("COMMIT");

    res.json({
      message: "Sales Order cancelled successfully",
      salesOrder: updatedOrder.rows[0],
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

module.exports = {
  getSalesOrders,
  confirmSalesOrder,
    dispatchSalesOrder,
    getSalesOrderById,
    cancelSalesOrder,
};


