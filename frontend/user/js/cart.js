/**
 * Willuda Inn - Booking Cart & Selection Manager
 * Manages selected accommodation packages, date selections, and cart persistence in localStorage.
 */
"use strict";

const BookingCart = {
  STORAGE_KEY: "willuda_booking_cart",

  getCart() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : { items: [], totalAmount: 0 };
    } catch {
      return { items: [], totalAmount: 0 };
    }
  },

  saveCart(cart) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: cart }));
  },

  addItem(item) {
    const cart = this.getCart();
    const existing = cart.items.find(i => i.id === item.id);
    if (existing) {
      existing.nights = (existing.nights || 1) + (item.nights || 1);
    } else {
      cart.items.push({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        nights: item.nights || 1,
        checkIn: item.checkIn || "",
        checkOut: item.checkOut || ""
      });
    }
    this.calculateTotals(cart);
    this.saveCart(cart);
  },

  removeItem(id) {
    const cart = this.getCart();
    cart.items = cart.items.filter(i => i.id !== id);
    this.calculateTotals(cart);
    this.saveCart(cart);
  },

  clearCart() {
    localStorage.removeItem(this.STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: null }));
  },

  calculateTotals(cart) {
    cart.totalAmount = cart.items.reduce((sum, item) => sum + (item.price * (item.nights || 1)), 0);
  }
};
