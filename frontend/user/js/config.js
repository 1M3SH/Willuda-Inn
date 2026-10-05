"use strict";

/* =====================================================
   WILLUDA INN - USER FRONTEND API CONFIGURATION
   Auto-detects Localhost vs Vercel Production
===================================================== */

const WILLUDA_CONFIG = (() => {
    const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "0.0.0.0";

    const customApi =
        window.WILLUDA_API_URL ||
        localStorage.getItem("willudaApiUrl");

    const PRODUCTION_API = "https://willuda-inn-backend.up.railway.app";

    const apiBase = customApi
        ? customApi.replace(/\/+$/, "")
        : isLocal
            ? "http://localhost:5000"
            : PRODUCTION_API;

    return {
        isLocal,
        apiBase,
        apiUrl: `${apiBase}/api`,
        login: `${apiBase}/api/auth/login`,
        register: `${apiBase}/api/auth/register`,
        bookings: `${apiBase}/api/bookings`,
        customers: `${apiBase}/api/customers`,
        facilities: `${apiBase}/api/facilities`,
        events: `${apiBase}/api/events`,
        payments: `${apiBase}/api/payments`,
        health: `${apiBase}/api/health`
    };
})();

window.WILLUDA_CONFIG = WILLUDA_CONFIG;
window.API_BASE_URL = WILLUDA_CONFIG.apiBase;
