import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/api";

const Dashboard = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [
          enquiryData,
          quotationData,
          salesOrderData,
          inventoryData,
        ] = await Promise.all([
          apiRequest("/enquiries"),
          apiRequest("/quotations"),
          apiRequest("/sales-orders"),
          apiRequest("/inventory"),
        ]);

        setEnquiries(enquiryData.enquiries);
        setQuotations(quotationData.quotations);
        setSalesOrders(salesOrderData.salesOrders);
        setInventory(inventoryData.inventory);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const cards = [
    {
      title: "Total Enquiries",
      value: enquiries.length,
      description: "Customer enquiries",
    },
    {
      title: "Total Quotations",
      value: quotations.length,
      description: "Created quotations",
    },
    {
      title: "Sales Orders",
      value: salesOrders.length,
      description: "Customer orders",
    },
    {
      title: "Inventory Items",
      value: inventory.length,
      description: "Products in inventory",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>

          <p className="mt-2 text-gray-600">
            Overview of your ERP operations.
          </p>
        </div>

        {loading && (
          <p className="mt-8 text-gray-600">
            Loading dashboard...
          </p>
        )}

        {error && (
          <div className="mt-8 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Statistics */}
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl bg-white p-6 shadow"
                >
                  <p className="text-sm font-medium text-gray-500">
                    {card.title}
                  </p>

                  <p className="mt-3 text-3xl font-bold text-gray-900">
                    {card.value}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent Data */}
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {/* Recent Enquiries */}
              <div className="rounded-xl bg-white p-6 shadow">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Enquiries
                </h2>

                {enquiries.length === 0 ? (
                  <p className="mt-4 text-gray-500">
                    No enquiries found.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {enquiries.slice(0, 5).map((enquiry) => (
                      <div
                        key={enquiry.id}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {enquiry.enquiry_number}
                          </p>

                          <p className="text-sm text-gray-500">
                            {enquiry.company_name}
                          </p>
                        </div>

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                          {enquiry.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Sales Orders */}
              <div className="rounded-xl bg-white p-6 shadow">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Sales Orders
                </h2>

                {salesOrders.length === 0 ? (
                  <p className="mt-4 text-gray-500">
                    No sales orders found.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {salesOrders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.order_number}
                          </p>

                          <p className="text-sm text-gray-500">
                            {order.company_name}
                          </p>
                        </div>

                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          {order.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;