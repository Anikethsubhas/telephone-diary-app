const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const mysql = require('mysql2');

function initialize(passport) {
  const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'ani',
    password: 'password',
    database: 'UserInfo'
  });

  const authenticateUser = async (email, password, done) => {
    try {
      const [rows, fields] = await pool.promise().query('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length === 0) {
        return done(null, false, { message: 'No user with that email' });
      }
      const user = rows[0];
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Password incorrect' });
      }
    } catch (error) {
      return done(error);
    }
  };

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const [rows, fields] = await pool.promise().query('SELECT * FROM users WHERE id = ?', [id]);
      if (rows.length === 0) {
        return done(null, false);
      }
      const user = rows[0];
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  });
}

module.exports = initialize;
