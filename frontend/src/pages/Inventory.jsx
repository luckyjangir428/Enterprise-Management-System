import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/api";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInventory = async () => {
      try {
        const data = await apiRequest("/inventory");

        setInventory(data.inventory);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Inventory
        </h1>

        <p className="mt-2 text-gray-600">
          Current product availability.
        </p>

        {loading && (
          <p className="mt-6 text-gray-600">
            Loading inventory...
          </p>
        )}

        {error && (
          <p className="mt-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Physical</th>
                  <th className="px-6 py-4">Reserved</th>
                  <th className="px-6 py-4">Available</th>
                </tr>
              </thead>

              <tbody>
                {inventory.map((item) => (
                  <tr
                    key={item.product_id}
                    className="border-b"
                  >
                    <td className="px-6 py-4">
                      {item.product_code}
                    </td>

                    <td className="px-6 py-4 font-medium">
                      {item.product_name}
                    </td>

                    <td className="px-6 py-4">
                      {item.physical_quantity}
                    </td>

                    <td className="px-6 py-4">
                      {item.reserved_quantity}
                    </td>

                    <td className="px-6 py-4 font-semibold">
                      {item.available_quantity}
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
}

export default Inventory;