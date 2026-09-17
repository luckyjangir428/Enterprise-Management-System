import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/api";

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [customerId, setCustomerId] = useState("");
  const [enquiryDate, setEnquiryDate] = useState("");
  const [requiredDate, setRequiredDate] = useState("");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState([
    {
      product_id: "",
      quantity: 1,
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      const [enquiryData, customerData, productData] =
        await Promise.all([
          apiRequest("/enquiries"),
          apiRequest("/customers"),
          apiRequest("/products"),
        ]);

      setEnquiries(enquiryData.enquiries);
      setCustomers(customerData.customers);
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
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      return;
    }

    setItems(items.filter((_, itemIndex) => itemIndex !== index));
  };

 
const handleSubmit = async (event) => {
  event.preventDefault();

  setError("");
  setSuccess("");
  setSubmitting(true);

  try {
    const data = await apiRequest("/enquiries", {
      method: "POST",
      body: JSON.stringify({
        enquiryNumber: `ENQ-${Date.now()}`,
        customerId: Number(customerId),
        requiredDate,
        products: items.map((item) => ({
          productId: Number(item.product_id),
          quantity: Number(item.quantity),
        })),
        notes,
      }),
    });

    setSuccess(
      `Enquiry ${data.enquiry.enquiry_number} created successfully.`
    );

    setCustomerId("");
    setEnquiryDate("");
    setRequiredDate("");
    setNotes("");

    setItems([
      {
        product_id: "",
        quantity: 1,
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
        <h1 className="text-3xl font-bold text-gray-900">
          Enquiries
        </h1>

        <p className="mt-2 text-gray-600">
          Create and manage customer enquiries.
        </p>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900">
            Create Enquiry
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

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-6"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Customer
              </label>

              <select
                value={customerId}
                onChange={(event) =>
                  setCustomerId(event.target.value)
                }
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
              >
                <option value="">
                  Select customer
                </option>

                {customers.map((customer) => (
                  <option
                    key={customer.id}
                    value={customer.id}
                  >
                    {customer.company_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Enquiry Date
                </label>

                <input
                  type="date"
                  value={enquiryDate}
                  onChange={(event) =>
                    setEnquiryDate(event.target.value)
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Required Date
                </label>

                <input
                  type="date"
                  value={requiredDate}
                   min={enquiryDate}
                  onChange={(event) =>
                    setRequiredDate(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  Products
                </h3>

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
                    className="grid gap-4 rounded-lg border border-gray-200 p-4 md:grid-cols-[1fr_180px_auto]"
                  >
                    <select
                      value={item.product_id}
                      onChange={(event) =>
                        handleItemChange(
                          index,
                          "product_id",
                          event.target.value
                        )
                      }
                      required
                      className="rounded-lg border border-gray-300 px-4 py-2"
                    >
                      <option value="">
                        Select product
                      </option>

                      {products.map((product) => (
                        <option
                          key={product.id}
                          value={product.id}
                        >
                          {product.product_code} -{" "}
                          {product.name}
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
                          event.target.value
                        )
                      }
                      required
                      className="rounded-lg border border-gray-300 px-4 py-2"
                      placeholder="Quantity"
                    />

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="rounded-lg border border-red-200 px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Notes
              </label>

              <textarea
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                rows="4"
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                placeholder="Additional requirements..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Creating..."
                : "Create Enquiry"}
            </button>
          </form>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">
            Existing Enquiries
          </h2>

          {loading && (
            <p className="mt-4 text-gray-600">
              Loading enquiries...
            </p>
          )}

          {!loading && enquiries.length === 0 && (
            <p className="mt-4 rounded-lg bg-white p-6 text-gray-600 shadow">
              No enquiries found.
            </p>
          )}

          {!loading && enquiries.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow">
              <table className="w-full text-left">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4">Enquiry No.</th>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Contact Person</th>
                    <th className="px-6 py-4">City</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {enquiries.map((enquiry) => (
                    <tr
                      key={enquiry.id}
                      className="border-b"
                    >
                      <td className="px-6 py-4 font-medium">
                        {enquiry.enquiry_number}
                      </td>

                      <td className="px-6 py-4">
                        {enquiry.company_name}
                      </td>

                      <td className="px-6 py-4">
                        {enquiry.contact_person}
                      </td>

                      <td className="px-6 py-4">
                        {enquiry.city}
                      </td>

                      <td className="px-6 py-4">
                        {enquiry.status}
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
}

export default Enquiries;