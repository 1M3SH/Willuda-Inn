/**
 * Willuda Inn - Facilities & Products Controller
 * Handles loading, filtering, and displaying available hotel rooms, halls, and facilities.
 */
"use strict";

const API_BASE = "http://localhost:5000/api";

const ProductsController = {
  async fetchFacilities() {
    try {
      const response = await fetch(`${API_BASE}/facilities`);
      if (!response.ok) throw new Error("Failed to load facilities");
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.warn("API offline, falling back to local facility defaults:", error);
      return [
        {
          id: 1,
          name: "Deluxe Ocean Suite",
          type: "Room",
          price: 220,
          capacity: "2 Guests",
          image: "assets/images/facility-room.png",
          description: "Luxurious suite with ocean views, king bed, and private balcony."
        },
        {
          id: 2,
          name: "Grand Ballroom & Wedding Hall",
          type: "Hall",
          price: 850,
          capacity: "250 Guests",
          image: "assets/images/facility-hall.png",
          description: "Spacious venue designed for weddings, banquets, and major celebrations."
        },
        {
          id: 3,
          name: "Palm Garden Pavilion",
          type: "Outdoor",
          price: 450,
          capacity: "150 Guests",
          image: "assets/images/facility-garden.png",
          description: "Lush tropical garden setting ideal for receptions and private gatherings."
        }
      ];
    }
  },

  renderFacilityGrid(facilities, containerId = "facilitiesGrid") {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = facilities.map(item => `
      <article class="facility-card card" data-id="${item.id}">
        <div class="facility-image">
          <img src="${item.image || 'assets/images/facility-room.png'}" alt="${item.name}">
        </div>
        <div class="facility-content card-body">
          <span class="badge badge-warning">${item.type}</span>
          <h3 style="margin-top: 10px;">${item.name}</h3>
          <p class="text-muted" style="color: #666; font-size: 14px; margin: 10px 0;">${item.description}</p>
          <div class="facility-footer" style="display:flex; justify-content:space-between; align-items:center; margin-top:15px;">
            <div class="facility-price">
              <strong style="font-size: 20px; color: #e2b95b;">$${item.price}</strong>
              <small style="color: #888;">/ night</small>
            </div>
            <a href="booking.html?facilityId=${item.id}" class="btn btn-primary" style="padding: 8px 18px; font-size: 14px;">Book Now</a>
          </div>
        </div>
      </article>
    `).join("");
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  if (document.getElementById("facilitiesGrid")) {
    const list = await ProductsController.fetchFacilities();
    ProductsController.renderFacilityGrid(list);
  }
});
