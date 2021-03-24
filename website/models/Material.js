const mysql = require("../tools/mysql_");
const { format } = require('mysql');

exports.getById = function(id){
    var sql = "SELECT * FROM `material` WHERE `id` = ?";
    sql = format(sql, id);
    return mysql.get(sql);
}

exports.getAll = function(){
    var sql = "SELECT * FROM `material`";
    return mysql.query(sql);
}

exports.save = function(name, amount, price, supplier){

    let sql = "INSERT INTO `material` (`name`, `amount`, `price`, `fk_Supplier`) VALUES ( ? , ? , ? , ? )";
    var inserts = [name, amount, price, supplier];
    sql = format(sql, inserts);
    return mysql.insert(sql);
}

exports.savePotteryMaterial = function(material, amount, potteryId){

    let sql = "INSERT INTO `poterrymaterial` (`fk_Material`, `fk_Pottery`, `amount`) VALUES ( ? , ? , ? )";
    var inserts = [material, potteryId, amount];
    sql = format(sql, inserts);
    return mysql.insert(sql);
}