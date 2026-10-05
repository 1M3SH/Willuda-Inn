"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..", "..");

function pagesIn(folder) {
    return fs.readdirSync(folder, { withFileTypes: true }).filter((entry) => entry.isFile() && entry.name.endsWith(".html")).map((entry) => path.join(folder, entry.name));
}

test("every public and admin HTML page has a title and only local assets that exist", () => {
    const userFolder = path.join(root, "frontend", "user");
    const adminFolder = path.join(root, "frontend", "admin");
    const legacyAdminFolder = path.join(root, "admin");
    const pages = [
        ...pagesIn(root),
        ...(fs.existsSync(userFolder) ? pagesIn(userFolder) : []),
        ...(fs.existsSync(adminFolder) ? pagesIn(adminFolder) : []),
        ...(fs.existsSync(legacyAdminFolder) ? pagesIn(legacyAdminFolder) : [])
    ];
    const failures = [];
    assert.ok(pages.length > 0);
    for (const page of pages) {
        const html = fs.readFileSync(page, "utf8");
        if (!/<title>[^<]+<\/title>/i.test(html)) failures.push(`${path.relative(root, page)} needs a title`);
        const references = [...html.matchAll(/(?:src|href)=["']([^"'#?]+)["']/gi)].map((match) => match[1]).filter((reference) => !/^(?:https?:|mailto:|tel:|#)/i.test(reference));
        for (const reference of references) {
            if (!fs.existsSync(path.resolve(path.dirname(page), reference))) failures.push(`${path.relative(root, page)} references missing asset ${reference}`);
        }
    }
    assert.deepEqual(failures, []);
});
