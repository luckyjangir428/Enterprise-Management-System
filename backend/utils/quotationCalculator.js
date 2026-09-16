function calculateQuotationItem(item) {
  const baseAmount = item.quantity * item.unitPrice;

  const discountAmount =
    baseAmount * (item.discountPercent / 100);

  const amountAfterDiscount =
    baseAmount - discountAmount;

  const gstAmount =
    amountAfterDiscount * (item.gstPercent / 100);

  const lineAmount =
    amountAfterDiscount + gstAmount;

  return {
    baseAmount,
    discountAmount,
    gstAmount,
    lineAmount,
  };
}

module.exports = {
  calculateQuotationItem,
};