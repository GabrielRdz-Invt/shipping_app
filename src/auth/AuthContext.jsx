import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);
const STORAGE_KEY = "shipping_app_auth";


function readStored() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const { user, exp } = JSON.parse(raw);
        if (!user || !exp) return null;
        if (Date.now() > exp) { localStorage.removeItem(STORAGE_KEY); return null; }
        return { user, exp };
    }
    catch
    { 
        return null;
    }
}

export function AuthProvider({ children, sessionHours = 8 }) {
    const [user, setUser] = useState(() => {
        const s = readStored();
        return s?.user ?? null;
    });

    useEffect(() => {
        if (!user) { localStorage.removeItem(STORAGE_KEY); return; }
        const exp = Date.now() + sessionHours * 60 * 60 * 1000;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, exp }));
    }, [user, sessionHours]);

    // --- CAMBIO: login sin credenciales — consulta whoAmI() en la API externa ---
    async function login() {
        const badge = await authApi.whoAmI();
        if (!badge) throw new Error("No se pudo obtener identidad (whoami)");
        setUser({ badge });
        return { badge };
    }

    // --- CAMBIO: validar permiso y registrar acceso ---
    async function ensureAuthorized(program = "IEP-CDS", section = "shipments") {
        const badge = user?.badge ?? (await authApi.whoAmI());
        if (!badge) throw new Error("No user (whoami)");
        const ok = await authApi.authorize(program);
        if (!ok) throw new Error("Forbidden");
        authApi.recordAccess({ badge, program, section }).catch(() => {});
        return { badge, program, section };
    }

    function logout() {
        authApi.logoutExternal().catch(() => {});
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


async function ensureAuthorized(program = "IEP-CDS", section = "shipments") {
    const badge = user?.badge ?? (await authApi.whoAmI());
    if (!badge) throw new Error("No user (whoami)");
    try {
        const ok = await authApi.authorize(program);
        if (!ok) throw new Error("Forbidden");      
    } catch (e) {
        console.warn("[ensureAuthorized] authorize failed, proceeding in dev:", e);
    }
    authApi.recordAccess({ badge, program, section }).catch(() => {});
    return { badge, program, section };
}
