const mysql = require("../tools/mysql_");
const { format } = require('mysql');

exports.save = function(comment, potteryType, orderId, clientId, clay, glaze){
    let sql = "INSERT INTO `potteryorder` (`comment`, `type`, `fk_Order`, `fk_Client`, `fk_Clay`, `fk_Glaze`) VALUES ( ?, ?, ?, ?, ?, ?);";
    var inserts = [comment, potteryType, orderId, clientId, clay, glaze];
    sql = format(sql, inserts);
    return mysql.insert(sql);
}