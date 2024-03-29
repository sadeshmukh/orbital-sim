const { response } = require("express");
const express = require("express");
const app = express();
app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("*", function (req, res) {
  res.status(404).sendFile(__dirname + "/404.html");
});

app.listen(process.env.PORT || 3000, function () {
  console.log(`Server started on port ${process.env.PORT || 3000}`);
});
