import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/api";

const Quotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [products, setProducts] = useState([]);

  const [enquiryId, setEnquiryId] = useState("");
  const [validUntil, setValidUntil] = useState("");

  const [items, setItems] = useState([
    {
      product_id: "",
      quantity: 1,
      unit_price: "",
      discount_percent: 0,
      gst_percent: 18,
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      const [quotationData, enquiryData, productData] = await Promise.all([
        apiRequest("/quotations"),
        apiRequest("/enquiries"),
        apiRequest("/products"),
      ]);

      setQuotations(quotationData.quotations);
      setEnquiries(enquiryData.enquiries);
      setProducts(productData.products);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProductChange = (index, productId) => {
    const updatedItems = [...items];

    updatedItems[index].product_id = productId;

    const selectedProduct = products.find(
      (product) => product.id === Number(productId),
    );

    if (selectedProduct) {
      updatedItems[index].unit_price = selectedProduct.base_price;
    }

    setItems(updatedItems);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];

    updatedItems[index][field] = value;

    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        product_id: "",
        quantity: 1,
        unit_price: "",
        discount_percent: 0,
        gst_percent: 18,
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      return;
    }

    setItems(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleStatusChange = async (quotationId, status) => {
    setError("");
    setSuccess("");

    try {
      await apiRequest(`/quotations/${quotationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
        }),
      });

      setSuccess(`Quotation status changed to ${status}.`);

      await loadData();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleConvert = async (quotationId) => {
  setError("");
  setSuccess("");

  try {
    const data = await apiRequest(
      `/quotations/${quotationId}/convert`,
      {
        method: "POST",
      }
    );

    setSuccess(
      `Sales Order ${data.salesOrder.order_number} created successfully.`
    );

    await loadData();
  } catch (error) {
    setError(error.message);
  }
};

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const data = await apiRequest("/quotations", {
        method: "POST",
        body: JSON.stringify({
          enquiry_id: Number(enquiryId),
          valid_until: validUntil || null,
          items: items.map((item) => ({
            product_id: Number(item.product_id),
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
            discount_percent: Number(item.discount_percent),
            gst_percent: Number(item.gst_percent),
          })),
        }),
      });

      setSuccess(
        `Quotation ${data.quotation.quotation_number} created successfully.`,
      );

      setEnquiryId("");
      setValidUntil("");

      setItems([
        {
          product_id: "",
          quantity: 1,
          unit_price: "",
          discount_percent: 0,
          gst_percent: 18,
        },
      ]);

      await loadData();
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>

        <p className="mt-2 text-gray-600">
          Create and manage customer quotations.
        </p>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900">
            Create Quotation
          </h2>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 rounded-lg bg-green-50 p-4 text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Enquiry
                </label>

                <select
                  value={enquiryId}
                  onChange={(event) => setEnquiryId(event.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                >
                  <option value="">Select enquiry</option>

                  {enquiries.map((enquiry) => (
                    <option key={enquiry.id} value={enquiry.id}>
                      {enquiry.enquiry_number} - {enquiry.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Valid Until
                </label>

                <input
                  type="date"
                  value={validUntil}
                  onChange={(event) => setValidUntil(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Products</h3>

                <button
                  type="button"
                  onClick={addItem}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  + Add Product
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                      <select
                        value={item.product_id}
                        onChange={(event) =>
                          handleProductChange(index, event.target.value)
                        }
                        required
                        className="rounded-lg border border-gray-300 px-3 py-2"
                      >
                        <option value="">Product</option>

                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.product_code} - {product.name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) =>
                          handleItemChange(
                            index,
                            "quantity",
                            event.target.value,
                          )
                        }
                        required
                        placeholder="Quantity"
                        className="rounded-lg border border-gray-300 px-3 py-2"
                      />

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(event) =>
                          handleItemChange(
                            index,
                            "unit_price",
                            event.target.value,
                          )
                        }
                        required
                        placeholder="Unit Price"
                        className="rounded-lg border border-gray-300 px-3 py-2"
                      />

                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.discount_percent}
                        onChange={(event) =>
                          handleItemChange(
                            index,
                            "discount_percent",
                            event.target.value,
                          )
                        }
                        placeholder="Discount %"
                        className="rounded-lg border border-gray-300 px-3 py-2"
                      />

                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.gst_percent}
                        onChange={(event) =>
                          handleItemChange(
                            index,
                            "gst_percent",
                            event.target.value,
                          )
                        }
                        placeholder="GST %"
                        className="rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="mt-3 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Quotation"}
            </button>
          </form>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">
            Existing Quotations
          </h2>

          {loading && (
            <p className="mt-4 text-gray-600">Loading quotations...</p>
          )}

          {!loading && quotations.length === 0 && (
            <p className="mt-4 rounded-lg bg-white p-6 text-gray-600 shadow">
              No quotations found.
            </p>
          )}

          {!loading && quotations.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow">
              <table className="w-full text-left">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4">Quotation No.</th>
                    <th className="px-6 py-4">Enquiry</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Grand Total</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {quotations.map((quotation) => (
                    <tr key={quotation.id} className="border-b">
                      <td className="px-6 py-4 font-medium">
                        {quotation.quotation_number}
                      </td>

                      <td className="px-6 py-4">{quotation.enquiry_number}</td>

                      <td className="px-6 py-4">{quotation.company_name}</td>

                      <td className="px-6 py-4 font-semibold">
                        ₹{Number(quotation.grand_total).toFixed(2)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <span className="font-medium">
                            {quotation.status}
                          </span>

                          {quotation.status === "DRAFT" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(quotation.id, "SENT")
                              }
                              className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                            >
                              Mark Sent
                            </button>
                          )}

                          {quotation.status === "SENT" && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusChange(quotation.id, "ACCEPTED")
                                }
                                className="rounded-lg bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                              >
                                Accept
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusChange(quotation.id, "REJECTED")
                                }
                                className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </div>
                          )}

                          {quotation.status === "ACCEPTED" && (
                            <button
                              type="button"
                              onClick={() => handleConvert(quotation.id)}
                              className="rounded-lg bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700"
                            >
                              Convert to Order
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Quotations;
