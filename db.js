const mysql = require('mysql2')


const con = mysql.createPool({
    host: "database-1.c1gko0s6qhw7.ap-south-1.rds.amazonaws.com",
    user: "admin",
    password: "12345678",
    database: "UserInfo",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

con.connect(function(err) {
    if (err) {
        console.error("Error connecting to MySQL:", err);
    } else {
        console.log("Connected to MySQL database successfully!");
    }
});

module.exports = con;

