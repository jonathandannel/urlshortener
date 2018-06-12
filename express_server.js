const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "343n1hf": "http://www.help.net"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  let entries = Object.entries(urlDatabase); //array of key/value
  let templateVars = { urls: entries};
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: [req.params.id, urlDatabase[req.params.id]] };
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = 1;
  res.render("urls_new", templateVars)
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
