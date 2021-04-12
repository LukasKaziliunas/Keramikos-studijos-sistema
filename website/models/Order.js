const mysql = require("../tools/mysql_");
const { format } = require('mysql');

exports.getDeliveryTypes = function(){
    let sql = "SELECT * FROM deliverytype";
    return mysql.query(sql);
}

exports.save = function(sum, city, address, state, orderType, deliverytype){
    let sql = "INSERT INTO `order` (`date`, `sum`, `city`, `address`, `state`, `orderType`, `deliverytype`) VALUES (DATE(NOW()), ?, ?, ?, ?, ?, ? )";
    var inserts = [sum, city, address, state, orderType, deliverytype];
    sql = format(sql, inserts);
    return mysql.insert(sql);
}