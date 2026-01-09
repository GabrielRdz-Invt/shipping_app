import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);
const STORAGE_KEY = "shipping_app_auth";
const FORCE_LOGOUT_KEY = "FORCE_LOGOUT";

function readStored() {
    try {
        if (localStorage.getItem(FORCE_LOGOUT_KEY) === "1") return null;

        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const { user, exp } = JSON.parse(raw);
        if (!user || !exp) return null;
        if (Date.now() > exp) { localStorage.removeItem(STORAGE_KEY); return null; }
        return { user, exp };
    }
    catch
    {
        localStorage.removeItem(STORAGE_KEY);
        return null;
    }
}

export function AuthProvider({ children, sessionHours = 8 }) {
    const [user, setUser] = useState(() => {
        const s = readStored();
        return s?.user ?? null;
    });

    useEffect(() => {
        if (!user || localStorage.getItem(FORCE_LOGOUT_KEY) === "1") {
            localStorage.removeItem(STORAGE_KEY);
            return;
        }
        const exp = Date.now() + sessionHours * 60 * 60 * 1000;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, exp }));
    }, [user, sessionHours]);

    async function login() {
        if (user && localStorage.getItem(FORCE_LOGOUT_KEY) !== "1") return user;
        localStorage.removeItem(FORCE_LOGOUT_KEY);
        const badge = await authApi.whoAmI();
        if (!badge) throw new Error("No se pudo obtener identidad (whoami)");
        setUser({ badge });
        return { badge };
    }

    // --- CAMBIO: validar permiso y registrar acceso ---
    async function ensureAuthorized(program = "IEP-CDS", section = "shipments") {
        if (localStorage.getItem(FORCE_LOGOUT_KEY) === "1") {
            throw new Error("Forbidden (forced logout)");
        }

        const badge = user?.badge ?? (await authApi.whoAmI());

        if (!badge) throw new Error("No user (whoami)");
        const allowed = await authApi.authorize(program);

        if (!allowed) {
            throw new Error(`Forbidden: program=${program}`);
        }
        authApi.recordAccess({ badge, program, section }).catch(() => {});
        return { badge, program, section };
    }

    function logout() {
        localStorage.setItem(FORCE_LOGOUT_KEY, "1");
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    }

    const value = useMemo(() => ({ user, login, logout, ensureAuthorized }), [user]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}

export function hasValidSession(user) {
  return !!(user && user.badge);
}
