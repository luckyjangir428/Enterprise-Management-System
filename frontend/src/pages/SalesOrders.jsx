import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/api";

const SalesOrders = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSalesOrders = async () => {
    try {
      const data = await apiRequest("/sales-orders");
      setSalesOrders(data.salesOrders);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesOrders();
  }, []);

  const handleConfirm = async (orderId) => {
    setError("");

    try {
      await apiRequest(`/sales-orders/${orderId}/confirm`, {
        method: "POST",
      });

      await loadSalesOrders();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDispatch = async (orderId) => {
    setError("");

    try {
      const data = await apiRequest(`/sales-orders/${orderId}/dispatch`, {
        method: "POST",
        body: JSON.stringify({
          vehicle_number: "RJ14AB1234",
          driver_name: "Rahul Sharma",
        }),
      });

      alert(`Dispatch ${data.dispatch.dispatch_number} created successfully.`);

      await loadSalesOrders();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Sales Orders</h1>

        <p className="mt-2 text-gray-600">Manage customer sales orders.</p>

        {loading && (
          <p className="mt-6 text-gray-600">Loading sales orders...</p>
        )}

        {error && (
          <p className="mt-6 rounded-lg bg-red-50 p-4 text-red-600">{error}</p>
        )}

        {!loading && !error && salesOrders.length === 0 && (
          <div className="mt-6 rounded-xl bg-white p-6 shadow">
            <p className="text-gray-600">No sales orders found.</p>
          </div>
        )}

        {!loading && !error && salesOrders.length > 0 && (
          <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4">Order No.</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Quotation</th>
                  <th className="px-6 py-4">Order Date</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {salesOrders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="px-6 py-4 font-medium">
                      {order.order_number}
                    </td>

                    <td className="px-6 py-4">{order.company_name}</td>

                    <td className="px-6 py-4">{order.quotation_number}</td>

                    <td className="px-6 py-4">
                      {new Date(order.order_date).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 font-semibold">
                      ₹{Number(order.total_amount).toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <span className="font-medium">{order.status}</span>

                        {order.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() => handleConfirm(order.id)}
                            className="rounded-lg bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                          >
                            Confirm Order
                          </button>
                        )}
                        
                        {order.status === "CONFIRMED" && (
                          <button
                            type="button"
                            onClick={() => handleDispatch(order.id)}
                            className="rounded-lg bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700"
                          >
                            Dispatch
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
      </main>
    </div>
  );
};

export default SalesOrders;
