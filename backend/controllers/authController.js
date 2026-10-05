"use strict";

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authModel = require("../models/authModel");

/* =========================================
   REGISTERED USERS LOCAL STORE
========================================= */

const DATA_FILE = path.join(__dirname, "..", "data", "registered_users.json");

const defaultUsers = [
    {
        id: 1,
        full_name: "Prabhath Akalanka",
        email: "admin@willudainn.com",
        password: "$2b$10$1t.oymF4zEPvodZfb01UG.Rjg3Ie7HouqD4zspslXrS4zqytfmdYq",
        role: "Administrator",
        status: "Active"
    },
    {
        id: 2,
        full_name: "Tharuka Prabathiya",
        email: "tharukaprabathiya833@gmail.com",
        password: "$2b$10$/8AqZ8O.QNbWI/rrxpIiDeoNjkOcYVt3hmiObuDZFyKDjMjq3LIEm",
        role: "Customer",
        status: "Active"
    }
];

function getRegisteredUsers() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const raw = fs.readFileSync(DATA_FILE, "utf-8");
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                let modified = false;

                // Ensure default users exist in parsed list
                defaultUsers.forEach(defaultUser => {
                    const exists = parsed.some(
                        u => String(u.email).toLowerCase() === defaultUser.email.toLowerCase()
                    );
                    if (!exists) {
                        parsed.push(defaultUser);
                        modified = true;
                    }
                });

                // Enforce bcrypt hashing on all records (never keep plain text)
                parsed.forEach(user => {
                    if (user.password && !/^\$2[aby]\$\d{2}\$/.test(user.password)) {
                        user.password = bcrypt.hashSync(user.password, 10);
                        modified = true;
                    }
                });

                if (modified) {
                    saveRegisteredUsers(parsed);
                }

                return parsed;
            }
        }
    } catch (e) {
        console.warn("Could not read registered_users.json, using defaults:", e.message);
    }
    return [...defaultUsers];
}


function saveRegisteredUsers(users) {
    try {
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), "utf-8");
    } catch (e) {
        console.error("Could not write to registered_users.json:", e.message);
    }
}

async function verifyPassword(inputPassword, storedPassword) {
    if (!storedPassword) return false;
    const isHashed = /^\$2[aby]\$\d{2}\$/.test(storedPassword);
    if (isHashed) {
        return await bcrypt.compare(inputPassword, storedPassword);
    }
    return inputPassword === storedPassword;
}

/* =========================================
   LOGIN
========================================= */

function loginAdmin(req, res) {
    const email = String(req.body.email || "")
        .trim()
        .toLowerCase();

    const password = String(req.body.password || "");

    /* -----------------------------------------
       VALIDATION
    ----------------------------------------- */

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required."
        });
    }

    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is missing from the .env file.");
        return res.status(500).json({
            success: false,
            message: "Authentication configuration error."
        });
    }

    /* -----------------------------------------
       HELPER: CHECK LOCAL USERS STORE
    ----------------------------------------- */

    async function checkLocalStoreAndRespond() {
        const users = getRegisteredUsers();
        const found = users.find(
            u => String(u.email || "").trim().toLowerCase() === email
        );

        if (!found) {
            return res.status(401).json({
                success: false,
                message: "Invalid email address or password."
            });
        }

        if (String(found.status || "").trim().toLowerCase() !== "active") {
            return res.status(403).json({
                success: false,
                message: "This account is inactive."
            });
        }

        const passwordMatches = await verifyPassword(password, found.password);
        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email address or password."
            });
        }

        const token = jwt.sign(
            {
                adminId: found.id,
                userId: found.id,
                email: found.email,
                role: found.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        const userPayload = {
            id: found.id,
            fullName: found.full_name,
            full_name: found.full_name,
            email: found.email,
            role: found.role,
            status: found.status
        };

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            token,
            admin: userPayload,
            user: userPayload
        });
    }

    /* -----------------------------------------
       CHECK DATABASE
    ----------------------------------------- */

    authModel.findAdminByEmail(
        email,
        async function (databaseError, results) {
            if (databaseError) {
                console.warn(
                    "Database query error, checking registered users store:",
                    databaseError.message
                );
                return checkLocalStoreAndRespond();
            }

            if (!Array.isArray(results) || results.length === 0) {
                // If not found in admins table, check registered users store (e.g. customers)
                return checkLocalStoreAndRespond();
            }

            const admin = results[0];

            /* -----------------------------------------
               ACCOUNT STATUS
            ----------------------------------------- */

            if (
                String(admin.status)
                    .trim()
                    .toLowerCase() !== "active"
            ) {
                return res.status(403).json({
                    success: false,
                    message: "This administrator account is inactive."
                });
            }

            try {
                const storedPassword = String(admin.password || "");
                const passwordIsHashed = /^\$2[aby]\$\d{2}\$/.test(storedPassword);

                let passwordMatches = false;

                if (passwordIsHashed) {
                    passwordMatches = await bcrypt.compare(password, storedPassword);
                } else {
                    passwordMatches = password === storedPassword;
                }

                if (!passwordMatches) {
                    return res.status(401).json({
                        success: false,
                        message: "Invalid email address or password."
                    });
                }

                /* -----------------------------------------
                   AUTO-HASH OLD PLAIN-TEXT PASSWORD
                ----------------------------------------- */

                if (!passwordIsHashed) {
                    const hashedPassword = await bcrypt.hash(password, 12);
                    authModel.updateAdminPassword(
                        admin.id,
                        hashedPassword,
                        function (updateError) {
                            if (updateError) {
                                console.error("Password hashing update error:", updateError);
                            } else {
                                console.log("Admin password was securely hashed.");
                            }
                        }
                    );
                }

                /* -----------------------------------------
                   CREATE JWT TOKEN
                ----------------------------------------- */

                const token = jwt.sign(
                    {
                        adminId: admin.id,
                        userId: admin.id,
                        email: admin.email,
                        role: admin.role
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: "8h" }
                );

                const userPayload = {
                    id: admin.id,
                    fullName: admin.full_name,
                    full_name: admin.full_name,
                    email: admin.email,
                    role: admin.role,
                    status: admin.status
                };

                return res.status(200).json({
                    success: true,
                    message: "Login successful.",
                    token,
                    admin: userPayload,
                    user: userPayload
                });

            } catch (error) {
                console.error("Login processing error:", error);
                return res.status(500).json({
                    success: false,
                    message: "Unable to complete the login process."
                });
            }
        }
    );
}

/* =========================================
   REGISTER CUSTOMER
========================================= */

async function register(req, res) {
    const fullName = String(
        req.body.fullName || req.body.full_name || req.body.name || ""
    ).trim();

    const email = String(req.body.email || "")
        .trim()
        .toLowerCase();

    const password = String(req.body.password || "");

    if (!fullName || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Full name, email address, and password are required."
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid email address."
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters long."
        });
    }

    try {
        const users = getRegisteredUsers();
        const existing = users.find(
            u => String(u.email || "").trim().toLowerCase() === email
        );

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "An account with this email address already exists. Please login."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: users.length + 1,
            full_name: fullName,
            email: email,
            password: hashedPassword,
            role: "Customer",
            status: "Active",
            created_at: new Date().toISOString()
        };

        users.push(newUser);
        saveRegisteredUsers(users);

        // Attempt to persist to database tables if database is connected
        authModel.createUser(newUser, (dbErr) => {
            if (dbErr) {
                console.warn("Database user insert note:", dbErr.message);
            } else {
                console.log("User successfully saved to database table 'admins'.");
            }
        });

        try {
            const customerModel = require("../models/customerModel");
            customerModel.createCustomer({
                full_name: fullName,
                email: email,
                phone: req.body.phone || "",
                address: req.body.address || "",
                status: "Active"
            }).catch(err => {
                console.warn("Database customer insert note:", err.message);
            });
        } catch (e) {
            console.warn("Customer model write note:", e.message);
        }

        return res.status(201).json({
            success: true,
            message: "Account created successfully.",
            user: {
                id: newUser.id,
                fullName: newUser.full_name,
                full_name: newUser.full_name,
                email: newUser.email,
                role: newUser.role,
                status: newUser.status
            }
        });
    } catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to register account. Please try again."
        });
    }
}

/* =========================================
   EXPORT CONTROLLER
========================================= */

module.exports = {
    loginAdmin,
    register
};