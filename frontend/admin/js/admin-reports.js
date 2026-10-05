(function () {
    "use strict";

    /* Prevent duplicate script tags from running Reports twice. */
    if (window.__willudaReportsPageInitialized) {
        console.warn("Duplicate admin-reports.js load ignored.");
        return;
    }

    window.__willudaReportsPageInitialized = true;

    /* =====================================================
       WILLUDA INN REPORTS - FINAL ROBUST DATA FIX
       - Keeps the current HTML/CSS design
       - Loads each API independently
       - Uses booking revenue if payment API is unavailable
       - Replaces old sample charts
    ===================================================== */

    const API_PATHS = {
        bookings: "/api/bookings",
        customers: "/api/customers",
        facilities: "/api/facilities",
        events: "/api/events",
        payments: "/api/payments"
    };

    const productionHost =
        (window.WILLUDA_CONFIG && window.WILLUDA_CONFIG.apiBase) ||
        (window.WILLUDA_API_URL || localStorage.getItem("willudaApiUrl") || "https://willuda-inn-backend.up.railway.app").replace(/\/+$/, "");

    const API_HOSTS = [
        "http://127.0.0.1:5000",
        "http://localhost:5000",
        productionHost
    ];

    const data = {
        bookings: [],
        customers: [],
        facilities: [],
        events: [],
        payments: []
    };

    const endpointAvailable = {
        bookings: false,
        customers: false,
        facilities: false,
        events: false,
        payments: false
    };

    let revenueChartInstance = null;
    let bookingChartInstance = null;

    /* =====================================================
       ELEMENT DISCOVERY
    ===================================================== */

    function exactTextElement(textValue) {
        const wanted =
            String(textValue)
                .trim()
                .toLowerCase();

        return Array.from(
            document.querySelectorAll(
                "span, p, h1, h2, h3, h4, label, div"
            )
        ).find(function (element) {
            return (
                element.children.length === 0 &&
                element.textContent
                    .trim()
                    .toLowerCase() === wanted
            );
        }) || null;
    }

    function findValueElement(label, ids) {
        for (const id of ids) {
            const element =
                document.getElementById(id);

            if (element) {
                return element;
            }
        }

        const labelElement =
            exactTextElement(label);

        if (!labelElement) {
            return null;
        }

        let container =
            labelElement.parentElement;

        for (
            let level = 0;
            level < 6 && container;
            level += 1
        ) {
            const valueElement =
                container.querySelector(
                    "strong, .stat-value, .report-value, [data-report-value]"
                );

            if (
                valueElement &&
                valueElement !== labelElement
            ) {
                return valueElement;
            }

            container =
                container.parentElement;
        }

        return null;
    }

    function findSectionByHeading(
        headingText
    ) {
        const heading =
            exactTextElement(
                headingText
            );

        if (!heading) {
            return null;
        }

        return (
            heading.closest(
                "article, section, .chart-card, .report-card, .analytics-card"
            ) ||
            heading.parentElement
        );
    }

    function findOrCreateCanvas(
        headingText,
        ids
    ) {
        for (const id of ids) {
            const element =
                document.getElementById(id);

            if (element) {
                return element;
            }
        }

        const section =
            findSectionByHeading(
                headingText
            );

        if (!section) {
            return null;
        }

        let canvas =
            section.querySelector(
                "canvas"
            );

        if (!canvas) {
            canvas =
                document.createElement(
                    "canvas"
                );

            canvas.style.width =
                "100%";

            canvas.style.height =
                "100%";

            canvas.style.minHeight =
                "280px";

            section.appendChild(
                canvas
            );
        }

        return canvas;
    }

    function findFacilityBody() {
        const ids = [
            "facilityReportBody",
            "facilityUsageBody",
            "facilityTableBody",
            "reportFacilityBody"
        ];

        for (const id of ids) {
            const element =
                document.getElementById(id);

            if (element) {
                return element;
            }
        }

        const section =
            findSectionByHeading(
                "Facility Usage"
            );

        return (
            section?.querySelector("tbody") ||
            document.querySelector(
                ".facility-usage tbody, .facility-table tbody"
            )
        );
    }

    function findExportButton() {
        const ids = [
            "exportReportButton",
            "exportReportsButton",
            "reportExportButton"
        ];

        for (const id of ids) {
            const element =
                document.getElementById(id);

            if (element) {
                return element;
            }
        }

        return Array.from(
            document.querySelectorAll(
                "button, a"
            )
        ).find(function (element) {
            return element.textContent
                .trim()
                .toLowerCase()
                .includes(
                    "export report"
                );
        }) || null;
    }

    const elements = {};

    function discoverElements() {
        elements.totalRevenue =
            findValueElement(
                "Total Revenue",
                [
                    "totalRevenue",
                    "reportTotalRevenue",
                    "totalRevenueCount"
                ]
            );

        elements.totalBookings =
            findValueElement(
                "Total Bookings",
                [
                    "totalBookings",
                    "reportTotalBookings",
                    "totalBookingsCount"
                ]
            );

        elements.occupancyRate =
            findValueElement(
                "Occupancy Rate",
                [
                    "occupancyRate",
                    "reportOccupancyRate",
                    "occupancyRateCount"
                ]
            );

        elements.monthlyRevenue =
            findValueElement(
                "Monthly Revenue",
                [
                    "monthlyRevenue",
                    "reportMonthlyRevenue",
                    "monthlyRevenueCount"
                ]
            );

        elements.facilityBody =
            findFacilityBody();

        elements.revenueCanvas =
            findOrCreateCanvas(
                "Revenue Overview",
                [
                    "revenueChart",
                    "revenueOverviewChart"
                ]
            );

        elements.bookingCanvas =
            findOrCreateCanvas(
                "Booking Overview",
                [
                    "bookingChart",
                    "bookingOverviewChart"
                ]
            );

        elements.exportButton =
            findExportButton();
    }

    /* =====================================================
       HELPERS
    ===================================================== */

    function cleanText(value) {
        return String(
            value ?? ""
        ).trim();
    }

    function normalizeText(value) {
        return cleanText(
            value
        ).toLowerCase();
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );
    }

    function parseDate(value) {
        if (!value) {
            return null;
        }

        const date =
            new Date(
                String(value).replace(
                    " ",
                    "T"
                )
            );

        return Number.isNaN(
            date.getTime()
        )
            ? null
            : date;
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat(
            "en-LK",
            {
                style:
                    "currency",

                currency:
                    "LKR",

                maximumFractionDigits:
                    0
            }
        ).format(
            Number(value) || 0
        );
    }

    function extractArray(
        result,
        key
    ) {
        if (Array.isArray(result)) {
            return result;
        }

        if (
            Array.isArray(
                result?.data
            )
        ) {
            return result.data;
        }

        if (
            Array.isArray(
                result?.[key]
            )
        ) {
            return result[key];
        }

        if (
            Array.isArray(
                result?.records
            )
        ) {
            return result.records;
        }

        return [];
    }

    /* =====================================================
       API - TRY 127.0.0.1 AND LOCALHOST
    ===================================================== */

    async function requestEndpoint(
        key
    ) {
        let lastError = null;

        for (
            const host of API_HOSTS
        ) {
            try {
                const response =
                    await fetch(
                        host +
                        API_PATHS[key],
                        {
                            headers: {
                                Accept:
                                    "application/json"
                            }
                        }
                    );

                let result;

                try {
                    result =
                        await response.json();
                } catch (error) {
                    throw new Error(
                        "Invalid JSON response"
                    );
                }

                if (!response.ok) {
                    throw new Error(
                        result.message ||
                        `HTTP ${response.status}`
                    );
                }

                return result;
            } catch (error) {
                lastError = error;
            }
        }

        throw (
            lastError ||
            new Error(
                "API request failed"
            )
        );
    }

    async function loadAllData() {
        const keys =
            Object.keys(
                API_PATHS
            );

        const results =
            await Promise.allSettled(
                keys.map(
                    function (key) {
                        return requestEndpoint(
                            key
                        );
                    }
                )
            );

        results.forEach(
            function (
                result,
                index
            ) {
                const key =
                    keys[index];

                if (
                    result.status ===
                    "fulfilled"
                ) {
                    data[key] =
                        extractArray(
                            result.value,
                            key
                        );

                    endpointAvailable[key] =
                        true;
                } else {
                    data[key] = [];

                    endpointAvailable[key] =
                        false;

                    console.error(
                        `${key} API failed:`,
                        result.reason
                    );
                }
            }
        );

        console.log(
            "Reports API status:",
            {
                endpointAvailable,
                counts: {
                    bookings:
                        data.bookings.length,

                    customers:
                        data.customers.length,

                    facilities:
                        data.facilities.length,

                    events:
                        data.events.length,

                    payments:
                        data.payments.length
                }
            }
        );

        if (
            !endpointAvailable.bookings &&
            !endpointAvailable.facilities &&
            !endpointAvailable.payments
        ) {
            throw new Error(
                "Backend connection failed"
            );
        }
    }

    /* =====================================================
       DATA ACCESS
    ===================================================== */

    function bookingStatus(
        booking
    ) {
        return normalizeText(
            booking.status ||
            booking.booking_status ||
            "Pending"
        );
    }

    function bookingDate(
        booking
    ) {
        return (
            booking.created_at ||
            booking.check_in ||
            booking.checkin ||
            null
        );
    }

    function bookingAmount(
        booking
    ) {
        return Number(
            booking.total_price ||
            booking.total_amount ||
            booking.total ||
            0
        );
    }

    function bookingFacility(
        booking
    ) {
        return cleanText(
            booking.facility_name ||
            booking.room_type ||
            booking.facility ||
            "Unknown Facility"
        );
    }

    function paymentStatus(
        payment
    ) {
        return normalizeText(
            payment.payment_status ||
            payment.status ||
            "Pending"
        );
    }

    function paymentAmount(
        payment
    ) {
        return Number(
            payment.amount ||
            0
        );
    }

    function paymentDate(
        payment
    ) {
        return (
            payment.payment_date ||
            payment.created_at ||
            null
        );
    }

    function eventAmount(
        eventRecord
    ) {
        return Number(
            eventRecord.total_amount ||
            0
        );
    }

    function eventFacility(
        eventRecord
    ) {
        return cleanText(
            eventRecord.facility_name ||
            "Unknown Facility"
        );
    }

    function facilityName(
        facility
    ) {
        return cleanText(
            facility.facility_name ||
            facility.name ||
            "Facility"
        );
    }

    function facilityStatus(
        facility
    ) {
        return cleanText(
            facility.status ||
            "Available"
        );
    }

    /* =====================================================
       CALCULATIONS
    ===================================================== */

    function validPaymentRevenue(
        payments
    ) {
        return payments.reduce(
            function (
                total,
                payment
            ) {
                const status =
                    paymentStatus(
                        payment
                    );

                if (
                    status !== "paid" &&
                    status !== "partial"
                ) {
                    return total;
                }

                return (
                    total +
                    paymentAmount(
                        payment
                    )
                );
            },
            0
        );
    }

    function validBookingRevenue(
        bookings
    ) {
        return bookings.reduce(
            function (
                total,
                booking
            ) {
                if (
                    bookingStatus(
                        booking
                    ) ===
                    "cancelled"
                ) {
                    return total;
                }

                return (
                    total +
                    bookingAmount(
                        booking
                    )
                );
            },
            0
        );
    }

    function totalRevenueValue() {
        if (
            endpointAvailable.payments
        ) {
            return validPaymentRevenue(
                data.payments
            );
        }

        return validBookingRevenue(
            data.bookings
        );
    }

    function monthlyRevenueValue() {
        const now =
            new Date();

        if (
            endpointAvailable.payments
        ) {
            return data.payments.reduce(
                function (
                    total,
                    payment
                ) {
                    const date =
                        parseDate(
                            paymentDate(
                                payment
                            )
                        );

                    const status =
                        paymentStatus(
                            payment
                        );

                    if (
                        !date ||
                        (
                            status !==
                                "paid" &&
                            status !==
                                "partial"
                        ) ||
                        date.getMonth() !==
                            now.getMonth() ||
                        date.getFullYear() !==
                            now.getFullYear()
                    ) {
                        return total;
                    }

                    return (
                        total +
                        paymentAmount(
                            payment
                        )
                    );
                },
                0
            );
        }

        return data.bookings.reduce(
            function (
                total,
                booking
            ) {
                const date =
                    parseDate(
                        bookingDate(
                            booking
                        )
                    );

                if (
                    !date ||
                    date.getMonth() !==
                        now.getMonth() ||
                    date.getFullYear() !==
                        now.getFullYear() ||
                    bookingStatus(
                        booking
                    ) ===
                        "cancelled"
                ) {
                    return total;
                }

                return (
                    total +
                    bookingAmount(
                        booking
                    )
                );
            },
            0
        );
    }

    function occupancyRateValue() {
        if (
            data.bookings.length ===
            0
        ) {
            return 0;
        }

        const active =
            data.bookings.filter(
                function (
                    booking
                ) {
                    const status =
                        bookingStatus(
                            booking
                        );

                    return (
                        status ===
                            "confirmed" ||
                        status ===
                            "completed" ||
                        status ===
                            "checked-in"
                    );
                }
            ).length;

        return Math.round(
            (
                active /
                data.bookings.length
            ) *
            100
        );
    }

    /* =====================================================
       CARDS
    ===================================================== */

    function renderCards() {
        if (
            elements.totalRevenue
        ) {
            elements.totalRevenue
                .textContent =
                formatCurrency(
                    totalRevenueValue()
                );
        }

        if (
            elements.totalBookings
        ) {
            elements.totalBookings
                .textContent =
                data.bookings.length;
        }

        if (
            elements.occupancyRate
        ) {
            elements.occupancyRate
                .textContent =
                `${occupancyRateValue()}%`;
        }

        if (
            elements.monthlyRevenue
        ) {
            elements.monthlyRevenue
                .textContent =
                formatCurrency(
                    monthlyRevenueValue()
                );
        }
    }

    /* =====================================================
       MONTHLY DATA
    ===================================================== */

    function lastSixMonths() {
        const months = [];
        const now =
            new Date();

        for (
            let offset = 5;
            offset >= 0;
            offset -= 1
        ) {
            const date =
                new Date(
                    now.getFullYear(),
                    now.getMonth() -
                        offset,
                    1
                );

            months.push({
                year:
                    date.getFullYear(),

                month:
                    date.getMonth(),

                label:
                    date.toLocaleDateString(
                        "en-US",
                        {
                            month:
                                "short"
                        }
                    )
            });
        }

        return months;
    }

    function buildMonthlyData() {
        const months =
            lastSixMonths();

        const revenue =
            months.map(
                function (
                    monthItem
                ) {
                    if (
                        endpointAvailable
                            .payments
                    ) {
                        return data.payments
                            .reduce(
                                function (
                                    total,
                                    payment
                                ) {
                                    const date =
                                        parseDate(
                                            paymentDate(
                                                payment
                                            )
                                        );

                                    const status =
                                        paymentStatus(
                                            payment
                                        );

                                    if (
                                        !date ||
                                        (
                                            status !==
                                                "paid" &&
                                            status !==
                                                "partial"
                                        ) ||
                                        date.getFullYear() !==
                                            monthItem.year ||
                                        date.getMonth() !==
                                            monthItem.month
                                    ) {
                                        return total;
                                    }

                                    return (
                                        total +
                                        paymentAmount(
                                            payment
                                        )
                                    );
                                },
                                0
                            );
                    }

                    return data.bookings
                        .reduce(
                            function (
                                total,
                                booking
                            ) {
                                const date =
                                    parseDate(
                                        bookingDate(
                                            booking
                                        )
                                    );

                                if (
                                    !date ||
                                    date.getFullYear() !==
                                        monthItem.year ||
                                    date.getMonth() !==
                                        monthItem.month ||
                                    bookingStatus(
                                        booking
                                    ) ===
                                        "cancelled"
                                ) {
                                    return total;
                                }

                                return (
                                    total +
                                    bookingAmount(
                                        booking
                                    )
                                );
                            },
                            0
                        );
                }
            );

        const bookingCounts =
            months.map(
                function (
                    monthItem
                ) {
                    return data.bookings
                        .filter(
                            function (
                                booking
                            ) {
                                const date =
                                    parseDate(
                                        bookingDate(
                                            booking
                                        )
                                    );

                                return (
                                    date &&
                                    date.getFullYear() ===
                                        monthItem.year &&
                                    date.getMonth() ===
                                        monthItem.month
                                );
                            }
                        ).length;
                }
            );

        return {
            labels:
                months.map(
                    function (
                        monthItem
                    ) {
                        return monthItem.label;
                    }
                ),

            revenue,

            bookingCounts
        };
    }

    /* =====================================================
       CHARTS
    ===================================================== */

    function clearCanvas(
        canvas
    ) {
        if (!canvas) {
            return;
        }

        const parent =
            canvas.parentElement;

        if (parent) {
            parent.style.position =
                "relative";

            parent.style.minHeight =
                "300px";
        }
    }

    function renderCharts() {
        if (
            typeof window.Chart ===
            "undefined"
        ) {
            console.error(
                "Chart.js was not loaded."
            );

            return;
        }

        const monthly =
            buildMonthlyData();

        clearCanvas(
            elements.revenueCanvas
        );

        clearCanvas(
            elements.bookingCanvas
        );

        if (
            elements.revenueCanvas
        ) {
            const existingRevenueChart =
                window.Chart.getChart(
                    elements.revenueCanvas
                );

            if (existingRevenueChart) {
                existingRevenueChart.destroy();
            }

            revenueChartInstance
                ?.destroy();

            revenueChartInstance =
                new Chart(
                    elements
                        .revenueCanvas,
                    {
                        type:
                            "line",

                        data: {
                            labels:
                                monthly.labels,

                            datasets: [
                                {
                                    label:
                                        "Revenue",

                                    data:
                                        monthly.revenue,

                                    borderColor:
                                        "#d39b2c",

                                    backgroundColor:
                                        "rgba(211, 155, 44, 0.16)",

                                    borderWidth:
                                        3,

                                    pointRadius:
                                        4,

                                    fill:
                                        true,

                                    tension:
                                        0.35
                                }
                            ]
                        },

                        options: {
                            responsive:
                                true,

                            maintainAspectRatio:
                                false,

                            plugins: {
                                legend: {
                                    display:
                                        false
                                }
                            },

                            scales: {
                                y: {
                                    beginAtZero:
                                        true,

                                    ticks: {
                                        callback:
                                            function (
                                                value
                                            ) {
                                                return (
                                                    "LKR " +
                                                    Number(
                                                        value
                                                    )
                                                        .toLocaleString()
                                                );
                                            }
                                    }
                                },

                                x: {
                                    grid: {
                                        display:
                                            false
                                    }
                                }
                            }
                        }
                    }
                );
        }

        if (
            elements.bookingCanvas
        ) {
            const existingBookingChart =
                window.Chart.getChart(
                    elements.bookingCanvas
                );

            if (existingBookingChart) {
                existingBookingChart.destroy();
            }

            bookingChartInstance
                ?.destroy();

            bookingChartInstance =
                new Chart(
                    elements
                        .bookingCanvas,
                    {
                        type:
                            "bar",

                        data: {
                            labels:
                                monthly.labels,

                            datasets: [
                                {
                                    label:
                                        "Bookings",

                                    data:
                                        monthly
                                            .bookingCounts,

                                    backgroundColor:
                                        "#111b31",

                                    borderRadius:
                                        7
                                }
                            ]
                        },

                        options: {
                            responsive:
                                true,

                            maintainAspectRatio:
                                false,

                            plugins: {
                                legend: {
                                    display:
                                        false
                                }
                            },

                            scales: {
                                y: {
                                    beginAtZero:
                                        true,

                                    ticks: {
                                        precision:
                                            0
                                    }
                                },

                                x: {
                                    grid: {
                                        display:
                                            false
                                    }
                                }
                            }
                        }
                    }
                );
        }
    }

    /* =====================================================
       FACILITY TABLE
    ===================================================== */

    function facilityRevenue(
        name
    ) {
        const normalized =
            normalizeText(name);

        const bookingRevenue =
            data.bookings.reduce(
                function (
                    total,
                    booking
                ) {
                    if (
                        normalizeText(
                            bookingFacility(
                                booking
                            )
                        ) !==
                        normalized
                    ) {
                        return total;
                    }

                    return (
                        total +
                        bookingAmount(
                            booking
                        )
                    );
                },
                0
            );

        const eventRevenue =
            data.events.reduce(
                function (
                    total,
                    eventRecord
                ) {
                    if (
                        normalizeText(
                            eventFacility(
                                eventRecord
                            )
                        ) !==
                        normalized
                    ) {
                        return total;
                    }

                    return (
                        total +
                        eventAmount(
                            eventRecord
                        )
                    );
                },
                0
            );

        return (
            bookingRevenue +
            eventRevenue
        );
    }

    function renderFacilityTable() {
        if (
            !elements.facilityBody
        ) {
            return;
        }

        if (
            data.facilities.length ===
            0
        ) {
            elements.facilityBody
                .innerHTML = `
                    <tr>
                        <td colspan="3">
                            Facility API data is unavailable.
                        </td>
                    </tr>
                `;

            return;
        }

        elements.facilityBody
            .innerHTML =
            data.facilities
                .map(
                    function (
                        facility
                    ) {
                        const name =
                            facilityName(
                                facility
                            );

                        const status =
                            facilityStatus(
                                facility
                            );

                        return `
                            <tr>

                                <td>
                                    ${escapeHtml(
                                        name
                                    )}
                                </td>

                                <td>

                                    <span
                                        class="status-badge ${escapeHtml(
                                            normalizeText(
                                                status
                                            )
                                        )}"
                                    >
                                        ${escapeHtml(
                                            status
                                        )}
                                    </span>

                                </td>

                                <td>
                                    ${escapeHtml(
                                        formatCurrency(
                                            facilityRevenue(
                                                name
                                            )
                                        )
                                    )}
                                </td>

                            </tr>
                        `;
                    }
                )
                .join("");
    }

    /* =====================================================
       EXPORT
    ===================================================== */

    function excelSafe(value) {
        if (value === null || value === undefined) {
            return "";
        }

        const text = String(value);

        return /^[=+\-@]/.test(text)
            ? `'${text}`
            : value;
    }

    function rowsForExcel(records) {
        return records.map(
            function (record) {
                return Object.fromEntries(
                    Object.entries(record).map(
                        function ([key, value]) {
                            return [
                                key,
                                excelSafe(
                                    typeof value === "object" && value !== null
                                        ? JSON.stringify(value)
                                        : value
                                )
                            ];
                        }
                    )
                );
            }
        );
    }

    function appendWorksheet(workbook, name, rows) {
        const worksheet = XLSX.utils.json_to_sheet(rows);
        worksheet["!cols"] = Object.keys(rows[0] || {}).map(
            function (key) {
                return {
                    wch: Math.min(
                        Math.max(String(key).length + 2, 14),
                        32
                    )
                };
            }
        );
        XLSX.utils.book_append_sheet(workbook, worksheet, name);
    }

    function exportReport() {
        if (typeof XLSX === "undefined") {
            window.alert(
                "Excel export could not load. Check your internet connection and try again."
            );
            return;
        }

        const button = elements.exportButton;
        const originalButtonContent = button?.innerHTML;

        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Preparing Excel...';
        }

        try {
            const workbook = XLSX.utils.book_new();
            const exportedAt = new Date();

            appendWorksheet(workbook, "Summary", [
                { Metric: "Exported at", Value: exportedAt.toLocaleString("en-LK") },
                { Metric: "Total revenue", Value: totalRevenueValue() },
                { Metric: "Total bookings", Value: data.bookings.length },
                { Metric: "Occupancy rate", Value: `${occupancyRateValue()}%` },
                { Metric: "Monthly revenue", Value: monthlyRevenueValue() },
                { Metric: "Total customers", Value: data.customers.length },
                { Metric: "Total facilities", Value: data.facilities.length },
                { Metric: "Total events", Value: data.events.length },
                { Metric: "Total payments", Value: data.payments.length }
            ]);

            appendWorksheet(workbook, "Bookings", rowsForExcel(data.bookings));
            appendWorksheet(workbook, "Customers", rowsForExcel(data.customers));
            appendWorksheet(workbook, "Facilities", rowsForExcel(data.facilities));
            appendWorksheet(workbook, "Events", rowsForExcel(data.events));
            appendWorksheet(workbook, "Payments", rowsForExcel(data.payments));

            const datePart = exportedAt.toISOString().slice(0, 10);
            XLSX.writeFile(workbook, `willuda-inn-report-${datePart}.xlsx`);
        } catch (error) {
            console.error("Excel export error:", error);
            window.alert("Unable to create the Excel report. Please try again.");
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = originalButtonContent;
            }
        }
    }

    /* =====================================================
       ERROR
    ===================================================== */

    function renderConnectionError(
        error
    ) {
        console.error(
            "Reports initialization error:",
            error
        );

        if (
            elements.totalRevenue
        ) {
            elements.totalRevenue
                .textContent =
                "Backend offline";
        }

        if (
            elements.totalBookings
        ) {
            elements.totalBookings
                .textContent =
                "0";
        }

        if (
            elements.occupancyRate
        ) {
            elements.occupancyRate
                .textContent =
                "0%";
        }

        if (
            elements.monthlyRevenue
        ) {
            elements.monthlyRevenue
                .textContent =
                "Backend offline";
        }

        if (
            elements.facilityBody
        ) {
            elements.facilityBody
                .innerHTML = `
                    <tr>
                        <td colspan="3">
                            Backend connection failed.
                            Run node server.js and refresh the page.
                        </td>
                    </tr>
                `;
        }
    }

    /* =====================================================
       INITIALIZE
    ===================================================== */

    async function initialize() {
        discoverElements();

        if (
            elements.totalRevenue
        ) {
            elements.totalRevenue
                .textContent =
                "Loading...";
        }

        if (
            elements.totalBookings
        ) {
            elements.totalBookings
                .textContent =
                "...";
        }

        if (
            elements.occupancyRate
        ) {
            elements.occupancyRate
                .textContent =
                "...";
        }

        if (
            elements.monthlyRevenue
        ) {
            elements.monthlyRevenue
                .textContent =
                "Loading...";
        }

        elements.exportButton
            ?.addEventListener(
                "click",
                exportReport
            );

        try {
            await loadAllData();

            renderCards();
            renderFacilityTable();

            try {
                renderCharts();
            } catch (chartError) {
                console.error(
                    "Reports chart error:",
                    chartError
                );
            }
        } catch (error) {
            renderConnectionError(
                error
            );
        }
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );
    } else {
        initialize();
    }
})();
