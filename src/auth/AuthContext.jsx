import React, { createContext, useContext, useEffect, useMemo, useState} from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);
const STORAGE_KEY = "shipping_app_auth";

function readStored() {
    try
    {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const { user, exp } = JSON.parse(raw);
        if (!user || !exp) return null;
        if (Date.now() > exp) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
        return { user, exp };
    }
    catch
    {
        return null;
    }
}

export function AuthProvider({ children, sessionHours = 8 })
{
    const [user, setUser] = useState(() => {
        const s = readStored();
        return s?.user ?? null;
    });

    useEffect(() => {
        if (!user) {
            localStorage.removeItem(STORAGE_KEY);
            return;
        }
        const exp = Date.now() + sessionHours * 60 * 60 * 1000;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, exp }));
    }, [user, sessionHours]);

    async function login(username, password) {
        const identity = await authApi.login({ username, password });
        setUser(identity ?? null);
        return identity
    }

    function logout() {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    }

    const value = useMemo(() => ({ user, login, logout }), [user])
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx  = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}