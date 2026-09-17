import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <nav className="border-b bg-white px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/dashboard" className="text-xl font-bold text-blue-600">
         Enterprise Management System
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
            Dashboard
          </Link>

          <Link to="/enquiries" className="text-gray-700 hover:text-blue-600">
            Enquiries
          </Link>

          <Link to="/quotations" className="text-gray-700 hover:text-blue-600">
            Quotations
          </Link>

          <Link
            to="/sales-orders"
            className="text-gray-700 hover:text-blue-600"
          >
            Sales Orders
          </Link>

          <Link to="/inventory" className="text-gray-700 hover:text-blue-600">
            Inventory
          </Link>

          <span className="text-sm text-gray-500">{user?.role}</span>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
