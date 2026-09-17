import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Enquiries from "./pages/Enquiries";
import Quotations from "./pages/Quotations";
import SalesOrders from "./pages/SalesOrders";
import ProtectedRoute from "./components/ProtectedRoute";
import Inventory from "./pages/Inventory";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
        <Route
  path="/enquiries"
  element={
    <ProtectedRoute>
      <Enquiries />
    </ProtectedRoute>
  }
/>

<Route
  path="/quotations"
  element={
    <ProtectedRoute>
      <Quotations />
    </ProtectedRoute>
  }
/>

<Route
  path="/sales-orders"
  element={
    <ProtectedRoute>
      <SalesOrders />
    </ProtectedRoute>
  }
/>

<Route
  path="/inventory"
  element={
    <ProtectedRoute>
      <Inventory />
    </ProtectedRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;