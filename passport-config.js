const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const pool = require('./db');
const winston = require('winston');

// Configure the logger
const logger = winston.createLogger({
    transports: [
        new winston.transports.File({ filename: 'passport-info.log', level: 'info' }),
        new winston.transports.File({ filename: 'passport-error.log', level: 'error' })
    ]
});

function initialize(passport) {
    const authenticateUser = async (email, password, done) => {
        try {
            const [rows] = await pool.promise().query('SELECT * FROM users WHERE email = ?', [email]);
            if (rows.length === 0) {
                logger.warn(`No user with email: ${email}`);
                return done(null, false, { message: 'No user with that email' });
            }
            const user = rows[0];
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                logger.error(`Incorrect password for email: ${email}`);
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch (error) {
            logger.error(`Error during authentication: ${error.message}`);
            return done(error);
        }
    };

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
            const [rows] = await pool.promise().query('SELECT * FROM users WHERE id = ?', [id]);
            if (rows.length === 0) {
                return done(null, false);
            }
            const user = rows[0];
            return done(null, user);
        } catch (error) {
            logger.error(`Error during deserialization: ${error.message}`);
            return done(error);
        }
    });
}

module.exports = initialize;
