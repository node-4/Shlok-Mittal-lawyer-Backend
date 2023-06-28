const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const compression = require("compression");
const serverless = require("serverless-http");
const app = express();
const path = require("path");
app.use(compression({ threshold: 500 }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
if (process.env.NODE_ENV == "production") {
    console.log = function () {};
}
//console.log = function () {};
app.get("/", (req, res) => {
    res.send("Hello World!");
});
require("./routes/customer.route")(app);
require("./routes/notification.route")(app);
require("./routes/lawyer.route")(app);
require("./routes/admin.route")(app);
require("./routes/static.route")(app);
require("./routes/helpandsupport.route")(app);
mongoose.Promise = global.Promise;
mongoose.set("strictQuery", true);

mongoose.connect(process.env.DB_URL, (err) => {
    if (!err) {
        console.log("MongoDB Connection Succeeded.");
    } else {
        console.log("Error in DB connection: " + err);
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}!`);
});

module.exports = { handler: serverless(app) };
