const request = require("supertest");
const app = require("../server");
const db = require("../config/db");

describe("RBAC API", () => {
  let salesToken;

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "sales@example.com",
        password: "Sales@123",
      });

    salesToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await db.end();
  });

  test("should not allow SALES_USER to confirm a Sales Order", async () => {
    const response = await request(app)
      .post("/api/sales-orders/2/confirm")
      .set("Authorization", `Bearer ${salesToken}`);

    expect(response.statusCode).toBe(403);
  });
});