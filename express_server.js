var express = require("express");
var app = express();
var PORT = 8080;
const bcrypt = require('bcrypt');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  keys: ['user_id']
}));

app.use(express.static(__dirname + '/public'));
app.set("view engine", "ejs");

////////////////////////////////////

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

////////////////////////////////

function generateRandomString() {
  var letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var numbers = '0123456789';
  var output = '';
  for (i = 0; i < 3; i++) {
    var currentLetter = Math.floor(Math.random() * 52);
    var currentNumber = Math.floor(Math.random() * 10);
    output += letters[currentLetter];
    output += numbers[currentNumber];
  }
  return output;
}

////////////////////////////////////
let errors = [];

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/error", (req, res) => {
  let templateVars = { errorList: errors, user: [req.session.user_id], urls: urlDatabase, userList: userDatabase };
  res.render("error", templateVars)
});

app.get("/urls", (req, res) => {
  let templateVars = { user: [req.session.user_id], urls: urlDatabase, userList: userDatabase};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  var generatedUrl = generateRandomString();
  urlDatabase['' + generatedUrl] = {
    short: generatedUrl,
    long: req.body.longURL,
    belongsTo: req.session.user_id
  };

  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  var templateVars = { user: [req.session.user_id], urls: urlDatabase, userList: userDatabase };
  res.render("urls_new", templateVars);
})

app.get("/urls/:id", (req, res) => {
  let templateVars = { user: req.session.user_id, url:  urlDatabase[req.params.id], userList: userDatabase };
  console.log(templateVars);
  if (urlDatabase[req.params.id].belongsTo !== req.session.user_id) {
    errors.push("You do not have permissions to edit or access this URL.")
    res.redirect("/error");
  }
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id].long = req.body.changedURL;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  var long = urlDatabase[req.params.shortURL].long;
  res.redirect(long);
});

app.post("/register", (req, res) => {
  var id = generateRandomString();
  var password = req.body.password? req.body.password : null;
  var email = '';

  if (req.body.email) {
    for (key in userDatabase) {
      if (userDatabase[key].email === req.body.email) {
        errors.push('Email already registered.');
        res.redirect("/error");
      } else {
      email = req.body.email;
    }
  }
}

  if (password !== null) {
    var hashedPassword = bcrypt.hashSync(password, 10);
    userDatabase[id] = {
      id: id,
      email: email,
      password: hashedPassword
    };
    console.log(hashedPassword);
    req.session.user_id = id;
    res.redirect('/urls');
  } else {
    res.status(403);
    errors.push('You must enter a valid password.');
    res.redirect("/error");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  var found = false;
  var errorMessage = 'Email not found.'
  for (let user in userDatabase) {
    let currentUser = userDatabase[user];
    if (currentUser.email === req.body.email) {
      if (bcrypt.compareSync(req.body.password, currentUser.password)) {
        found = currentUser;
      } else {
        errorMessage = 'Incorrect password.'
      }
    }
  }

  if (found) {
    req.session.user_id = found.id;
    res.redirect('/urls');
  } else {
    errors.push(errorMessage);
    if (errors.length > 1) {
      errors.shift();
    }
    res.redirect("/error");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

////////////////////////////////////

app.listen(PORT, () => {
  console.log(` => * tinyApp server listening on port ${PORT} *`);
});
