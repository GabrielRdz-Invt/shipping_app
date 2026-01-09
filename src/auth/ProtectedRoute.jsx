import React, { useEffect, useState } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const FORCE_LOGOUT_KEY = "FORCE_LOGOUT";

export default function ProtectedRoute({
  children,
  program = "IEP-CDS",
  section = "shipments",
}) {
  const { user, login, ensureAuthorized } = useAuth();
  const location = useLocation();

  const [ok, setOk] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (localStorage.getItem(FORCE_LOGOUT_KEY) === "1") {
          throw new Error("Forced logout");
        }

        if (!user) {
          await login();
        }
        await ensureAuthorized(program, section);

        if (mounted) {
          setOk(true);
          setError(null);
        }

      } catch (e) {
        console.error("[ProtectedRoute] access check failed:", e);
        if (mounted) {
          setOk(false);
          setError(e);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user, program, section, login, ensureAuthorized]);

  
  if (!ok && error) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (!ok && !error) {
    return <div className="p-3">Checking access…</div>;
  }

  return <Outlet />;

}

/* ***** saved in case the first function doesn't work *****
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
*/