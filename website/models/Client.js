const mysql = require("../tools/mysql_");
const { format } = require('mysql');

exports.save = function(name, lastname, phone, userId){

    let sql = "INSERT INTO `client` (`name`, `lastname`, `phone`, `fk_User`) VALUES ( ? , ?, ?, ? )";
    var inserts = [name, lastname, phone, userId];
    sql = format(sql, inserts);
    return mysql.insert(sql);
}