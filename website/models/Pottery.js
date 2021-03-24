const mysql = require("../tools/mysql_");
const { format } = require('mysql');

exports.getById = function(id){
    var sql = "SELECT * FROM `pottery` WHERE `id` = ?";
    sql = format(sql, id);
    return mysql.get(sql);
}

exports.getAll = function(){
    var sql = "SELECT * FROM `pottery`";
    return mysql.query(sql);
}

exports.getTypes = function(){
    var sql = "SELECT * FROM `potterytype`";
    return mysql.query(sql);
}

exports.save = function(name, price, description, type){
    let sql = "INSERT INTO `pottery` (`price`, `description`, `name`, `type`, `dateOfManufacture`, `fk_PotteryPurchase`, `fk_Worker`, `state`) VALUES ( ?, ?, ?, ?, DATE(NOW()), NULL, '1', '1');";
    var inserts = [price, description, name, type];
    sql = format(sql, inserts);
    return mysql.insert(sql);
}

exports.savePhoto = function(url, potteryId){
    let sql = "INSERT INTO `photo` (`url`, `fk_Pottery`) VALUES ( ?, ? );";
    var inserts = [url, potteryId];
    sql = format(sql, inserts);
    return mysql.insert(sql);
}