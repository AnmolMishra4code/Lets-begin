const express = require("express");
const path = require("path");
const fs = require("fs");
const useragent = require("express-useragent");
const geoip = require("geoip-lite");

const app = express();

app.use(useragent.express());

app.use((req, res, next) => {
    if (req.path === "/") {
        const ip =
            req.headers["x-forwarded-for"] ||
            req.socket.remoteAddress ||
            "Unknown";

        const geo = geoip.lookup(ip);

        const visitor = {
            time: new Date().toLocaleString(),
            ip: ip,
            browser: req.useragent.browser,
            os: req.useragent.os,
            platform: req.useragent.platform,
            device: req.useragent.isMobile ? "Mobile" : "Desktop",
            country: geo ? geo.country : "Unknown",
            city: geo ? geo.city : "Unknown",
            page: req.path,
            referrer: req.headers.referer || "Direct"
        };

        let visitors = [];

        if (fs.existsSync("visitors.json")) {
            visitors = JSON.parse(fs.readFileSync("visitors.json"));
        }

        visitors.push(visitor);

        fs.writeFileSync(
            "visitors.json",
            JSON.stringify(visitors, null, 2)
        );

        console.log(visitor);
    }

    next();
});

app.use(express.static(path.join(__dirname, "public")));

// API to get all visitors
app.get("/api/visitors", (req, res) => {
    try {
        const visitors = JSON.parse(
            fs.readFileSync("visitors.json", "utf8")
        );

        res.json(visitors);
    } catch (err) {
        res.status(500).json({
            error: "Unable to read visitors data."
        });
    }
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});