const pool = require("../config/db");

const getInventory = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        i.id,
        p.id AS product_id,
        p.product_code,
        p.product_name,
        p.category,
        p.unit,
        i.physical_quantity,
        i.reserved_quantity,
        (i.physical_quantity - i.reserved_quantity) AS available_quantity
      FROM inventory i
      JOIN products p
        ON i.product_id = p.id
      ORDER BY p.id
    `);

    res.json({
      inventory: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getInventory,
};