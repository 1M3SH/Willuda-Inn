"use strict";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authModel =
    require("../models/authModel");

/* =========================================
   LOGIN ADMIN
========================================= */

function loginAdmin(req, res) {
    const email =
        String(
            req.body.email || ""
        )
            .trim()
            .toLowerCase();

    const password =
        String(
            req.body.password || ""
        );

    /* -----------------------------------------
       VALIDATION
    ----------------------------------------- */

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message:
                "Email and password are required."
        });
    }

    if (!process.env.JWT_SECRET) {
        console.error(
            "JWT_SECRET is missing from the .env file."
        );

        return res.status(500).json({
            success: false,
            message:
                "Authentication configuration error."
        });
    }

    /* -----------------------------------------
       FIND ADMIN
    ----------------------------------------- */

    authModel.findAdminByEmail(
        email,
        async function (
            databaseError,
            results
        ) {
            if (databaseError) {
                console.error(
                    "Admin search error:",
                    databaseError
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Database error while checking login details."
                });
            }

            if (
                !Array.isArray(results) ||
                results.length === 0
            ) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid email address or password."
                });
            }

            const admin = results[0];

            /* -----------------------------------------
               ACCOUNT STATUS
            ----------------------------------------- */

            if (
                String(admin.status)
                    .trim()
                    .toLowerCase() !==
                "active"
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "This administrator account is inactive."
                });
            }

            try {
                const storedPassword =
                    String(
                        admin.password || ""
                    );

                const passwordIsHashed =
                    /^\$2[aby]\$\d{2}\$/.test(
                        storedPassword
                    );

                let passwordMatches =
                    false;

                /* -----------------------------------------
                   CHECK PASSWORD
                ----------------------------------------- */

                if (passwordIsHashed) {
                    passwordMatches =
                        await bcrypt.compare(
                            password,
                            storedPassword
                        );
                } else {
                    /*
                       This supports the current plain-text
                       password only for the first login.
                    */

                    passwordMatches =
                        password ===
                        storedPassword;
                }

                if (!passwordMatches) {
                    return res.status(401).json({
                        success: false,
                        message:
                            "Invalid email address or password."
                    });
                }

                /* -----------------------------------------
                   AUTO-HASH OLD PLAIN-TEXT PASSWORD
                ----------------------------------------- */

                if (!passwordIsHashed) {
                    const hashedPassword =
                        await bcrypt.hash(
                            password,
                            12
                        );

                    authModel.updateAdminPassword(
                        admin.id,
                        hashedPassword,
                        function (
                            updateError
                        ) {
                            if (updateError) {
                                console.error(
                                    "Password hashing update error:",
                                    updateError
                                );
                            } else {
                                console.log(
                                    "Admin password was securely hashed."
                                );
                            }
                        }
                    );
                }

                /* -----------------------------------------
                   CREATE JWT TOKEN
                ----------------------------------------- */

                const token =
                    jwt.sign(
                        {
                            adminId:
                                admin.id,

                            email:
                                admin.email,

                            role:
                                admin.role
                        },
                        process.env.JWT_SECRET,
                        {
                            expiresIn:
                                "8h"
                        }
                    );

                /* -----------------------------------------
                   SUCCESS RESPONSE
                ----------------------------------------- */

                return res.status(200).json({
                    success: true,

                    message:
                        "Login successful.",

                    token,

                    admin: {
                        id:
                            admin.id,

                        fullName:
                            admin.full_name,

                        email:
                            admin.email,

                        role:
                            admin.role,

                        status:
                            admin.status
                    }
                });

            } catch (error) {
                console.error(
                    "Login processing error:",
                    error
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Unable to complete the login process."
                });
            }
        }
    );
}

/* =========================================
   EXPORT CONTROLLER
========================================= */

module.exports = {
    loginAdmin
};