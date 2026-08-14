"use strict";

const assert = require("node:assert/strict");
const http = require("node:http");
const path = require("node:path");
const test = require("node:test");

process.env.JWT_SECRET = "test-secret";

const dbFile = path.join(__dirname, "..", "config", "db.js");
require.cache[require.resolve(dbFile)] = {
    id: dbFile,
    filename: dbFile,
    loaded: true,
    exports: { connect(callback) { if (callback) callback(null); } }
};

function callbackResult(value) {
    return (...args) => args[args.length - 1](null, value);
}

const bookings = [{ id: 1, customer_name: "Existing booking" }];
const customers = [{ id: 1, full_name: "Existing customer", email: "existing@example.com" }];
const facilities = [{ id: 1, facility_name: "Existing facility" }];
const events = [{ id: 1, event_name: "Existing event" }];
const payments = [{ id: 1, amount: 1200 }];

const models = {
    auth: {
        findAdminByEmail(email, callback) {
            callback(null, email === "admin@example.com" ? [{ id: 1, full_name: "Admin", email, password: "secret", role: "Administrator", status: "Active" }] : []);
        },
        updateAdminPassword: callbackResult({ affectedRows: 1 })
    },
    booking: {
        getAllBookings: callbackResult(bookings),
        getBookingById(id, callback) { callback(null, bookings.filter((item) => item.id === Number(id))); },
        createBooking(data, callback) { const item = { id: bookings.length + 1, ...data }; bookings.push(item); callback(null, { insertId: item.id }); },
        updateBooking(id, data, callback) { const item = bookings.find((entry) => entry.id === Number(id)); if (item) Object.assign(item, data); callback(null, { affectedRows: item ? 1 : 0 }); },
        deleteBooking(id, callback) { const index = bookings.findIndex((entry) => entry.id === Number(id)); if (index >= 0) bookings.splice(index, 1); callback(null, { affectedRows: index >= 0 ? 1 : 0 }); }
    },
    customer: {
        async getAllCustomers() { return customers; },
        async getCustomerById(id) { return customers.find((item) => item.id === Number(id)) || null; },
        async getCustomerByEmail(email) { return customers.find((item) => item.email === String(email).toLowerCase()) || null; },
        async createCustomer(data) { const item = { id: customers.length + 1, ...data }; customers.push(item); return { insertId: item.id }; },
        async updateCustomer(id, data) { Object.assign(customers.find((item) => item.id === Number(id)), data); return { affectedRows: 1 }; },
        async deleteCustomer(id) { const index = customers.findIndex((item) => item.id === Number(id)); if (index >= 0) customers.splice(index, 1); return { affectedRows: index >= 0 ? 1 : 0 }; }
    },
    facility: {
        async getAllFacilities() { return facilities; },
        async getFacilityById(id) { return facilities.find((item) => item.id === Number(id)) || null; },
        async createFacility(data) { const item = { id: facilities.length + 1, ...data }; facilities.push(item); return { insertId: item.id }; },
        async updateFacility(id, data) { Object.assign(facilities.find((item) => item.id === Number(id)), data); return { affectedRows: 1 }; },
        async deleteFacility(id) { const index = facilities.findIndex((item) => item.id === Number(id)); if (index >= 0) facilities.splice(index, 1); return { affectedRows: index >= 0 ? 1 : 0 }; }
    },
    event: {
        getAllEvents: callbackResult(events),
        getEventById(id, callback) { callback(null, events.filter((item) => item.id === Number(id))); },
        createEvent(data, callback) { const item = { id: events.length + 1, ...data }; events.push(item); callback(null, { insertId: item.id }); },
        updateEvent(id, data, callback) { const item = events.find((entry) => entry.id === Number(id)); if (item) Object.assign(item, data); callback(null, { affectedRows: item ? 1 : 0 }); },
        updateEventStatus(id, status, callback) { const item = events.find((entry) => entry.id === Number(id)); if (item) item.status = status; callback(null, { affectedRows: item ? 1 : 0 }); },
        deleteEvent(id, callback) { const index = events.findIndex((entry) => entry.id === Number(id)); if (index >= 0) events.splice(index, 1); callback(null, { affectedRows: index >= 0 ? 1 : 0 }); }
    },
    payment: {
        getAllPayments: callbackResult(payments),
        getPaymentById(id, callback) { callback(null, payments.filter((item) => item.id === Number(id))); },
        createPayment(data, callback) { const item = { id: payments.length + 1, ...data }; payments.push(item); callback(null, { insertId: item.id }); },
        updatePayment(id, data, callback) { const item = payments.find((entry) => entry.id === Number(id)); if (item) Object.assign(item, data); callback(null, { affectedRows: item ? 1 : 0 }); },
        updatePaymentStatus(id, status, callback) { const item = payments.find((entry) => entry.id === Number(id)); if (item) item.payment_status = status; callback(null, { affectedRows: item ? 1 : 0 }); },
        deletePayment(id, callback) { const index = payments.findIndex((entry) => entry.id === Number(id)); if (index >= 0) payments.splice(index, 1); callback(null, { affectedRows: index >= 0 ? 1 : 0 }); }
    }
};

for (const [name, model] of Object.entries(models)) {
    const file = path.join(__dirname, "..", "models", `${name}Model.js`);
    require.cache[require.resolve(file)] = { id: file, filename: file, loaded: true, exports: model };
}

const app = require("../server");
let server;
let baseUrl;

test.before(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => new Promise((resolve) => server.close(resolve)));

async function request(method, route, body) {
    const response = await fetch(`${baseUrl}${route}`, {
        method,
        headers: body ? { "content-type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined
    });
    return { status: response.status, body: await response.json() };
}

const bookingPayload = { customer_name: "Test guest", email: "guest@example.com", phone: "0712345678", room_type: "Deluxe", check_in: "2026-09-10", check_out: "2026-09-12", guests: 2, total_price: 25000 };
const customerPayload = { full_name: "New customer", email: "new@example.com", phone: "0712345678", address: "Colombo" };
const facilityPayload = { facility_name: "Test hall", facility_type: "Hall", location: "Ground floor", capacity: 60, price: 5000 };
const eventPayload = { customer_id: 1, facility_id: 1, event_name: "Test wedding", event_type: "Wedding", event_date: "2026-10-10", guest_count: 100, total_amount: 30000 };
const paymentPayload = { booking_id: 1, customer_id: 1, amount: 30000, payment_method: "Cash", payment_status: "Paid" };

test("service routes return the API metadata and 404 responses", async () => {
    const home = await request("GET", "/");
    const health = await request("GET", "/api/health");
    const missing = await request("GET", "/missing");
    assert.equal(home.status, 200); assert.equal(home.body.success, true);
    assert.equal(health.status, 200); assert.equal(health.body.success, true);
    assert.equal(missing.status, 404); assert.equal(missing.body.success, false);
});

test("authentication validates credentials and returns a token", async () => {
    assert.equal((await request("POST", "/api/auth/login", {})).status, 400);
    assert.equal((await request("POST", "/api/auth/login", { email: "nobody@example.com", password: "secret" })).status, 401);
    const login = await request("POST", "/api/auth/login", { email: "ADMIN@example.com", password: "secret" });
    assert.equal(login.status, 200); assert.equal(login.body.success, true); assert.ok(login.body.token);
});

test("booking API covers list, validation, CRUD and missing records", async () => {
    assert.equal((await request("GET", "/api/bookings")).status, 200);
    assert.equal((await request("GET", "/api/bookings/999")).status, 404);
    assert.equal((await request("POST", "/api/bookings", { ...bookingPayload, check_out: bookingPayload.check_in })).status, 400);
    const created = await request("POST", "/api/bookings", bookingPayload); assert.equal(created.status, 201);
    assert.equal((await request("PUT", "/api/bookings/2", { ...bookingPayload, status: "Confirmed" })).status, 200);
    assert.equal((await request("DELETE", "/api/bookings/2")).status, 200);
});

test("customer API covers list, duplicate protection, CRUD and missing records", async () => {
    assert.equal((await request("GET", "/api/customers")).status, 200);
    assert.equal((await request("POST", "/api/customers", { ...customerPayload, email: "existing@example.com" })).status, 409);
    const created = await request("POST", "/api/customers", customerPayload); assert.equal(created.status, 201);
    assert.equal((await request("PUT", "/api/customers/2", { ...customerPayload, status: "Active" })).status, 200);
    assert.equal((await request("DELETE", "/api/customers/2")).status, 200);
    assert.equal((await request("GET", "/api/customers/999")).status, 404);
});

test("facility API covers list, validation, CRUD and missing records", async () => {
    assert.equal((await request("GET", "/api/facilities")).status, 200);
    assert.equal((await request("POST", "/api/facilities", { ...facilityPayload, capacity: 0 })).status, 400);
    const created = await request("POST", "/api/facilities", facilityPayload); assert.equal(created.status, 201);
    assert.equal((await request("PUT", "/api/facilities/2", { ...facilityPayload, status: "Available" })).status, 200);
    assert.equal((await request("DELETE", "/api/facilities/2")).status, 200);
    assert.equal((await request("GET", "/api/facilities/999")).status, 404);
});

test("event API covers list, validation, CRUD, status changes and missing records", async () => {
    assert.equal((await request("GET", "/api/events")).status, 200);
    assert.equal((await request("POST", "/api/events", { ...eventPayload, event_name: "" })).status, 400);
    const created = await request("POST", "/api/events", eventPayload); assert.equal(created.status, 201);
    assert.equal((await request("PUT", "/api/events/2", eventPayload)).status, 200);
    assert.equal((await request("PATCH", "/api/events/2/status", { status: "Confirmed" })).status, 200);
    assert.equal((await request("DELETE", "/api/events/2")).status, 200);
    assert.equal((await request("GET", "/api/events/999")).status, 404);
});

test("payment API covers list, validation, CRUD, status changes and missing records", async () => {
    assert.equal((await request("GET", "/api/payments")).status, 200);
    assert.equal((await request("POST", "/api/payments", { ...paymentPayload, payment_method: "Crypto" })).status, 400);
    const created = await request("POST", "/api/payments", paymentPayload); assert.equal(created.status, 201);
    assert.equal((await request("PUT", "/api/payments/2", paymentPayload)).status, 200);
    assert.equal((await request("PATCH", "/api/payments/2/status", { payment_status: "Refunded" })).status, 200);
    assert.equal((await request("DELETE", "/api/payments/2")).status, 200);
    assert.equal((await request("GET", "/api/payments/999")).status, 404);
});
