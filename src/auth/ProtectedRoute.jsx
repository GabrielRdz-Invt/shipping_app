
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children, program = "IEP-CDS", section = "shipments" }) {
  const { user, login, ensureAuthorized } = useAuth();
  const location = useLocation();
  const [ok, setOk] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        if (!user) await login(); // whoAmI
        await ensureAuthorized(program, section); // authorize + recordAccess
        setOk(true);
      } catch (e) {
        console.error("[ProtectedRoute] access check failed:", e); // <- log
        setError(e);
        setOk(false);
      }
    })();
  }, [user, program, section]);

  if (error) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!ok) return <div className="p-3">Checking access...</div>;
  return children;
}
