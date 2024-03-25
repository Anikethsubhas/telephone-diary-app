const mysql = require('mysql2')


const con = mysql.createConnection({
    host: "terraform-20240325061504471800000001.c9a0ckk4eu0o.ap-south-1.rds.amazonaws.com",
    user: "admin",
    password: "12345678",
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

