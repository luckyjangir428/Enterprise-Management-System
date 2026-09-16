const {
  calculateQuotationItem,
} = require("../utils/quotationCalculator");

test("calculates quotation item amount correctly", () => {
  const result = calculateQuotationItem({
    quantity: 100,
    unitPrice: 1500,
    discountPercent: 5,
    gstPercent: 18,
  });

  expect(result.baseAmount).toBe(150000);
  expect(result.discountAmount).toBe(7500);
  expect(result.gstAmount).toBe(25650);
  expect(result.lineAmount).toBe(168150);
});