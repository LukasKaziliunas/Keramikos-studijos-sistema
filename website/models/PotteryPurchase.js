const mysql = require("../tools/mysql_");
const { format } = require('mysql');

exports.save = function(postalCode, orderId, clientId){
    let sql = "INSERT INTO `potterypurchase` (`postalCode`, `fk_Order`, `fk_Client`) VALUES ( ?, ?, ?);";
    var inserts = [postalCode, orderId, clientId];
    sql = format(sql, inserts);
    return mysql.insert(sql);
}