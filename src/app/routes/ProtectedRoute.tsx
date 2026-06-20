import { Navigate, Outlet, useLocation } from "react-router";
import { useApp } from "../context/AppContext";

export function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, isAuthLoading } = useApp();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen w-full max-w-md mx-auto bg-gradient-to-b from-[#0A0E15] via-[#0F141D] to-[#0A0E15] flex items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2ECC71] to-[#25A65A] animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
