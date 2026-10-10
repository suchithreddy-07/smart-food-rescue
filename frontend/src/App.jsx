import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Layout from "./components/Layout.jsx";
import ProviderHome from "./pages/ProviderHome.jsx";
import ListingForm from "./pages/ListingForm.jsx";
import IncomingRequests from "./pages/IncomingRequests.jsx";
import BrowseFood from "./pages/BrowseFood.jsx";
import MyRequests from "./pages/MyRequests.jsx";
import Pickups from "./pages/Pickups.jsx";
import PickupDetail from "./pages/PickupDetail.jsx";
import Transactions from "./pages/Transactions.jsx";
import AdminHome from "./pages/AdminHome.jsx";
import AiSearch from "./pages/AiSearch.jsx";

function Guard({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/app" replace />;
  return children;
}

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "ADMIN") return <Navigate to="/app/admin" replace />;
  if (user.role === "ORPHANAGE") return <Navigate to="/app/browse" replace />;
  return <Navigate to="/app/listings" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/app"
        element={
          <Guard>
            <Layout />
          </Guard>
        }
      >
        <Route index element={<HomeRedirect />} />
        <Route path="listings" element={<Guard roles={["PROVIDER", "ADMIN"]}><ProviderHome /></Guard>} />
        <Route path="listings/new" element={<Guard roles={["PROVIDER", "ADMIN"]}><ListingForm /></Guard>} />
        <Route path="listings/:id/edit" element={<Guard roles={["PROVIDER", "ADMIN"]}><ListingForm /></Guard>} />
        <Route path="incoming" element={<Guard roles={["PROVIDER", "ADMIN"]}><IncomingRequests /></Guard>} />
        <Route path="browse" element={<Guard roles={["ORPHANAGE", "ADMIN"]}><BrowseFood /></Guard>} />
        <Route path="requests" element={<Guard roles={["ORPHANAGE"]}><MyRequests /></Guard>} />
        <Route path="ai" element={<Guard roles={["ORPHANAGE", "ADMIN"]}><AiSearch /></Guard>} />
        <Route path="pickups" element={<Pickups />} />
        <Route path="pickups/:id" element={<PickupDetail />} />
        <Route path="history" element={<Transactions />} />
        <Route path="admin" element={<Guard roles={["ADMIN"]}><AdminHome /></Guard>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
