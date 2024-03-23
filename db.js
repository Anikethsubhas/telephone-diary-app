const mysql = require('mysql2')


const con = mysql.createConnection({
    host: "localhost",
    user: "ani",
    password: "password",
    database: "UserInfo"
})

con.connect(function(err) {
    if (err) {
        console.error("Error connecting to MySQL:", err);
    } else {
        console.log("Connected to MySQL database successfully!");
    }
});

module.exports = con;

