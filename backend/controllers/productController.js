const pool = require("../config/db");

const getProducts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        product_code,
        product_name,
        category,
        unit,
        base_price
      FROM products
      ORDER BY id
    `);

    res.json({
      products: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getProducts,
};