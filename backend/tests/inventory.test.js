const request = require("supertest");
const app = require("../server");
const db = require("../config/db");

describe("Inventory API", () => {
  let token;

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@example.com",
        password: "Admin@123",
      });

    token = loginResponse.body.token;
  });

  afterAll(async () => {
    // Restore original inventory
    await db.query(
      "UPDATE inventory SET physical_quantity = 200, reserved_quantity = 0 WHERE product_id = 1"
    );

    await db.end();
  });

  test("should not reserve more inventory than available", async () => {
    const orderId = 2;

    // Product 1: order requires 100,
    // but only 50 will be available.
    await db.query(
      "UPDATE inventory SET physical_quantity = 50, reserved_quantity = 0 WHERE product_id = 1"
    );

    const response = await request(app)
      .post(`/api/sales-orders/${orderId}/confirm`)
      .set("Authorization", `Bearer ${token}`);

    expect([400, 409]).toContain(response.statusCode);
  });
});