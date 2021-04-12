const mysql = require("../tools/mysql_");
const { format } = require('mysql');

exports.save = function(material, amount, potteryId){

    let sql = "INSERT INTO `poterrymaterial` (`fk_Material`, `fk_Pottery`, `amount`) VALUES ( ? , ? , ? )";
    var inserts = [material, potteryId, amount];
    sql = format(sql, inserts);
    return mysql.insert(sql);
}