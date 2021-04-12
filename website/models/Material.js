const mysql = require("../tools/mysql_");
const { format } = require('mysql');

exports.getById = function(id){
    var sql = "SELECT * FROM `material` WHERE `id` = ?";
    sql = format(sql, id);
    return mysql.getOne(sql);
}

exports.getAll = function(){
    var sql = "SELECT * FROM `material`";
    return mysql.query(sql);
}

exports.getClay = function(){
    var sql = "SELECT * FROM `material` WHERE `fk_MaterialType` = 1";
    return mysql.query(sql);
}

exports.getGlaze = function(){
    var sql = "SELECT * FROM `material` WHERE `fk_MaterialType` = 2";
    return mysql.query(sql);
}

exports.save = function(name, amount, price, supplier){

    let sql = "INSERT INTO `material` (`name`, `amount`, `price`, `fk_Supplier`) VALUES ( ? , ? , ? , ? )";
    var inserts = [name, amount, price, supplier];
    sql = format(sql, inserts);
    return mysql.insert(sql);
}