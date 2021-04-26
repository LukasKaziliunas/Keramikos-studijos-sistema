const mysql = require("../tools/mysql_");
const { format } = require('mysql');

exports.getPaymentTypes = function(){

    let sql = "SELECT * FROM paymenttype";
    return mysql.query(sql);
}

exports.save = function(sum, type, payer, orderId){
    let sql = "INSERT INTO `payment` (`sum`, `paymentType`, `payer`,  `fk_Order`, `date`) VALUES ( ?, ?, ?, ?, DATE(NOW()));";
    var inserts = [sum, type, payer, orderId];
    sql = format(sql, inserts);
    return mysql.insert(sql);
}
