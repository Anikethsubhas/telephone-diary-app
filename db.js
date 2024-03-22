const mysql = require('mysql2')
const dotenv = require('dotenv').config();

const con = mysql.createConnection({
    host: process.env.dbHost,
    user: process.env.dbUser,
    password: process.env.dbPass,
    database: process.env.dbBase
})

con.connect(function(err) {
    if (err) {
        console.error("Error connecting to MySQL:", err);
    } else {
        console.log("Connected to MySQL database successfully!");
    }
});

module.exports = con;

