"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");

const dbPath = path.join(__dirname, "..", "config", "db.js");
const calls = [];
const fakeDb = {
    query(sql, values, callback) {
        if (typeof values === "function") callback = values;
        calls.push({ sql, values: Array.isArray(values) ? values : [] });
        callback(null, []);
    }
};
require.cache[require.resolve(dbPath)] = { id: dbPath, filename: dbPath, loaded: true, exports: fakeDb };

function load(name) {
    const file = path.join(__dirname, "..", "models", `${name}Model.js`);
    delete require.cache[require.resolve(file)];
    return require(file);
}

function callbackCall(fn, ...args) {
    return new Promise((resolve) => fn(...args, () => resolve()));
}

test("all database model write/read operations use parameter placeholders", async () => {
    const booking = load("booking");
    await callbackCall(booking.getAllBookings); await callbackCall(booking.getBookingById, 7);
    await callbackCall(booking.createBooking, { customer_name: "A", email: "a@b.com", phone: "1", room_type: "Room", check_in: "2026-01-01", check_out: "2026-01-02", guests: 1, total_price: 100, status: "Pending" });
    await callbackCall(booking.updateBooking, 7, { customer_name: "A", email: "a@b.com", phone: "1", room_type: "Room", check_in: "2026-01-01", check_out: "2026-01-02", guests: 1, total_price: 100, status: "Pending" }); await callbackCall(booking.deleteBooking, 7);

    const auth = load("auth"); await callbackCall(auth.findAdminByEmail, "a@b.com"); await callbackCall(auth.updateAdminPassword, 1, "hash");
    const event = load("event"); await callbackCall(event.getAllEvents); await callbackCall(event.getEventById, 1); await callbackCall(event.createEvent, { customer_id: 1, facility_id: 1, event_name: "E", event_type: "T", event_date: "2026-01-01", start_time: null, end_time: null, guest_count: 1, total_amount: 0, status: "Planned", notes: null }); await callbackCall(event.updateEventStatus, 1, "Confirmed"); await callbackCall(event.deleteEvent, 1);
    const payment = load("payment"); await callbackCall(payment.getAllPayments); await callbackCall(payment.getPaymentById, 1); await callbackCall(payment.createPayment, { booking_id: 1, customer_id: 1, amount: 1, payment_method: "Cash", payment_status: "Paid", transaction_reference: "x", payment_date: null, notes: null }); await callbackCall(payment.updatePaymentStatus, 1, "Paid"); await callbackCall(payment.deletePayment, 1);

    const customer = load("customer"); await customer.getAllCustomers(); await customer.getCustomerById(1); await customer.getCustomerByEmail("a@b.com"); await customer.createCustomer({ full_name: "A", email: "a@b.com", phone: "1", address: "", status: "Active" }); await customer.updateCustomer(1, { full_name: "A", email: "a@b.com", phone: "1", address: "", status: "Active" }); await customer.deleteCustomer(1);
    const facility = load("facility"); await facility.getAllFacilities(); await facility.getFacilityById(1); await facility.createFacility({ facility_name: "F", facility_type: "T", location: "L", capacity: 1, description: "", price: 0, status: "Available" }); await facility.updateFacility(1, { facility_name: "F", facility_type: "T", location: "L", capacity: 1, description: "", price: 0, status: "Available" }); await facility.deleteFacility(1);

    assert.ok(calls.length >= 27);
    for (const call of calls.filter((call) => call.values.length > 0)) assert.match(call.sql, /\?/);
});
