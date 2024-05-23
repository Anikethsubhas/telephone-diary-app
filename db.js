const mysql = require('mysql2');

const pool = mysql.createPool({
    host: "database-1.c1gko0s6qhw7.ap-south-1.rds.amazonaws.com",
    user: "admin",
    password: "12345678",
    database: "UserInfo",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
