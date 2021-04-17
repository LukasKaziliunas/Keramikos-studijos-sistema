const mysql = require("../tools/mysql_");
const { format } = require('mysql');

exports.getById = function(id){
    var sql = "SELECT material.id as id, material.name as name, amount, price, fk_Supplier, `limit`, checkLimit, materialType, units.name as units  FROM material INNER JOIN units ON material.units = units.id WHERE material.id = ?";
    sql = format(sql, id);
    return mysql.getOne(sql);
}

exports.getAll = function(){
    var sql = "SELECT material.id as id, material.name as name, amount, price, fk_Supplier, `limit`, checkLimit, materialType, units.name as units  FROM material INNER JOIN units ON material.units = units.id;";
    return mysql.query(sql);
}

exports.getMultiple = function(idArray){
    idArray = [idArray]
    var sql = "SELECT * FROM `material` WHERE `id` IN ( ? ) "; 
    sql = format(sql, idArray);
    return mysql.query(sql);
}

exports.getClay = function(){
    var sql = "SELECT * FROM `material` WHERE `materialType` = 1";
    return mysql.query(sql);
}

exports.getGlaze = function(){
    var sql = "SELECT * FROM `material` WHERE `materialType` = 2";
    return mysql.query(sql);
}

exports.save = function(name, amount, price, supplier, limit, ckeckLimit, materialType, units){

    let sql = "INSERT INTO `material` (`name`, `amount`, `price`, `fk_Supplier`, `limit`, `checkLimit`, `materialType`, `units`) VALUES ( ? , ? , ? , ?, ?, ?, ?, ? )";
    var inserts = [name, amount, price, supplier, limit, ckeckLimit, materialType, units];
    sql = format(sql, inserts);
    return mysql.insert(sql);
}

exports.getLackingMaterials = function(){
    let sql = "SELECT * FROM `material` WHERE `checkLimit` = true AND `amount` < `limit`";
    return mysql.query(sql);
}
