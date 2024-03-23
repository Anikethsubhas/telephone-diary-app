const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const initializePassport = require('./passport-config');
const pool = require('./db');


initializePassport(
  passport,
  // Function to get user by email from the database
  email => {
    pool.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
      if (error) {
        throw error;
      }
      return results[0];
    });
  },
  // Function to get user by id from the database
  id => {
    pool.query('SELECT * FROM users WHERE id = ?', [id], (error, results) => {
      if (error) {
        throw error;
      }
      return results[0];
    });
  }
);

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// app.get('/', checkAuthenticated, (req, res) => {
//   res.render('index.ejs', { name: req.user.name });
// });
app.get('/', checkAuthenticated, async (req, res) => {
  try {
    // Fetch phone numbers associated with the logged-in user
    const [phoneNumbers] = await pool.promise().query('SELECT * FROM phone_numbers WHERE user_id = ?', [req.user.id]);
    res.render('index.ejs', { name: req.user.name, phoneNumbers });
  } catch (error) {
    console.error('Error fetching phone numbers:', error);
    res.redirect('/login'); // Redirect to login page in case of error
  }
});

app.post('/add-contact', checkAuthenticated, async (req, res) => {
  try {
    const { contact_name, phone_number } = req.body;

    // Check if the phone number is exactly 10 characters long
    if (phone_number.length !== 10) {
      req.flash('error', 'Phone number must be exactly 10 digits long');
      return res.redirect('/');
    }

    // Check if the phone number already exists in the database for the current user
    const [existingPhoneNumbers] = await pool.promise().query('SELECT * FROM phone_numbers WHERE user_id = ? AND phone_number = ?', [req.user.id, phone_number]);
    if (existingPhoneNumbers.length > 0) {
      req.flash('error', 'Phone number already exists');
      return res.redirect('/');
    }

    // Insert the new contact into the database
    await pool.promise().query('INSERT INTO phone_numbers (user_id, contact_name, phone_number) VALUES (?, ?, ?)', [req.user.id, contact_name, phone_number]);

    res.redirect('/');
  } catch (error) {
    console.error('Error adding contact:', error);
    res.redirect('/');
  }
});



app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs');
});

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const { name, email, password,confirm_password } = req.body;
    // Check if password and confirm password match
    if (password !== confirm_password) {
      req.flash('error', 'Passwords do not match');
      return res.redirect('/register');
    }

    // Check if email already exists in the database
    const [existingUsers] = await pool.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      // If email already exists, redirect to registration page with an error message
      req.flash('error', 'Email already exists');
      return res.redirect('/register');
    }

    // Email does not exist, proceed with registration
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.promise().query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);

    res.redirect('/login');
  } catch (error) {
    console.error('Error during registration:', error);
    res.redirect('/register');
  }
});

app.delete('/logout', (req, res) => {
  req.session.isAuthenticated = false; // Set authentication status to false
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/login');
  });
});




function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}

app.listen(3000);
