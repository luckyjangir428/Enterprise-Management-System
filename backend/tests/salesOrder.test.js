const request = require("supertest");
const app = require("../server");
const db = require("../config/db");

describe("Sales Order API", () => {
  let token;

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "sales@example.com",
        password: "Sales@123",
      });

    token = loginResponse.body.token;
  });

  afterAll(async () => {
    await db.end();
  });

  // Test #2
  test("should not create sales order from DRAFT quotation", async () => {
    const quotationId = 1;

    await db.query(
      "UPDATE quotations SET status = 'DRAFT' WHERE id = $1",
      [quotationId]
    );

    const response = await request(app)
      .post(`/api/quotations/${quotationId}/convert`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        orderNumber: `SO-DRAFT-${Date.now()}`,
      });

    expect(response.statusCode).toBe(400);
  });

  // Test #3
  test("should not create two sales orders from the same quotation", async () => {
    const quotationId = 1;

    // Set quotation to ACCEPTED because it already has a Sales Order.
    await db.query(
      "UPDATE quotations SET status = 'ACCEPTED' WHERE id = $1",
      [quotationId]
    );

    const response = await request(app)
      .post(`/api/quotations/${quotationId}/convert`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        orderNumber: `SO-DUPLICATE-${Date.now()}`,
      });

    expect(response.statusCode).toBe(409);
  });
});