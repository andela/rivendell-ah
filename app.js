express = require("express"),
bodyParser = require("body-parser")

// Create global app object
const app = express();


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

require("./models/User");

app.use(require("./routes"));

// Export express app to enable test runs exit after completion
module.exports = app;
