var express = require("express");
var app = express();
var PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

function generateRandomString() {
  var letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var numbers = '0123456789';
  var output = '';
  for (i = 0; i < 3; i++) {
    var currentLetter = Math.floor(Math.random() * 52);
    var currentNumber = Math.floor(Math.random() * 9);
    output += letters[currentLetter];
    output += numbers[currentNumber];
  }
  return output;
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "33n1hf": "http://www.help.net"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  let entries = Object.entries(urlDatabase); //array of key/value
  let templateVars = { urls: entries};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  var generatedUrl = generateRandomString();
  urlDatabase['' + generatedUrl] = req.body.longURL;
  res.redirect("/urls/" + generatedUrl);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: [req.params.id, urlDatabase[req.params.id]] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  var short = req.params.shortURL;
  var long = urlDatabase[short];
  res.redirect(long);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
})

app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id] = req.body.changedURL;
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});
