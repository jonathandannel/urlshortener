var express = require("express");
var app = express();
var PORT = 8080;
const bcrypt = require('bcrypt');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));
app.set("view engine", "ejs");


const password = "purple-monkey-dinosaur"; // you will probably this from req.params
const hashedPassword = bcrypt.hashSync(password, 10);

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
  "b2xVn2": {
    short: "b2xVn2",
    long: "http://www.lighthouselabs.ca",
    belongsTo: "userId"
  },
  "9sm5xK": {
    short: "9sm5xK",
    long: "http://www.google.com",
    belongsTo: "userId"
  },
  "33n1hf": {
    short: "33n1hf",
    long: "http://www.help.net",
    belongsTo: "userId"
  }
}

const userDatabase = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = { user: [req.cookies['user_id']], urls: urlDatabase, userList: userDatabase};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  var generatedUrl = generateRandomString();
  urlDatabase['' + generatedUrl] = {
    short: generatedUrl,
    long: req.body.longURL,
    belongsTo: req.cookies['user_id']
  };

  res.redirect("/urls/" + generatedUrl);
});

app.get("/urls/new", (req, res) => {
  var templateVars = { user: userDatabase[req.cookies['user_id']], userList: userDatabase };
  res.render("urls_new", templateVars);
})

app.get("/urls/:id", (req, res) => {
  let templateVars = { user: req.cookies['user_id'], url:  urlDatabase[req.params.id], userList: userDatabase };
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id].long = req.body.changedURL;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  var short = req.params.shortURL;
  var long = urlDatabase[short];
  res.redirect(long);
});

app.post("/register", (req, res) => {
  var id = generateRandomString();
  var email = req.body.email;
  var password = req.body.password;
  var hashedPassword = bcrypt.hashSync(password, 10);

  userDatabase[id] = {
    id: id,
    email: email,
    password: hashedPassword
  };
  console.log(hashedPassword);

  res.cookie('user_id', id);
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


app.post("/login", (req, res) => {
  var found = false;
  var errorMsg = 'Email not found.';
  for (let user in userDatabase) {
    let currentUser = userDatabase[user];
    if (currentUser.email === req.body.email) {
      if (bcrypt.compareSync(req.body.password, currentUser.password)) {
        found = currentUser;
      } else {
        errorMsg = 'Incorrect password!';
      }
    }
  }
  if (found) {
    res.cookie('user_id', found.id);
  } else {
    console.log(errorMsg);
  }
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
})

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});
