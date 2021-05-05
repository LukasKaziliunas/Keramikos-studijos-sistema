const mysql = require("../tools/mysql_");
const { format } = require('mysql');

exports.getById = function(id){
    var sql = "SELECT material.id as id, material.name as name, amount, price, fk_Supplier as supplier, `limit`, checkLimit, materialType, units.name as units, units.id as unitsId  FROM material INNER JOIN units ON material.units = units.id WHERE material.id = ?";
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
    let sql = "SELECT material.id as id, material.name as name, amount, price, fk_Supplier, `limit`, units.name as units  FROM material INNER JOIN units ON material.units = units.id WHERE `checkLimit` = true AND `amount` < `limit`";
    return mysql.query(sql);
}

exports.subtractAmount = function(materialId, amount)
{
   console.log(materialId, amount)  
   let sql = "UPDATE `material` SET ROUND(`amount` - ? , 2) WHERE `id` = ?;"
   var inserts = [(amount * 1).toFixed(2), materialId];
   sql = format(sql, inserts);
   console.log(sql);
   return mysql.query(sql);
}

exports.delete = function(materialId){
    var sql = "DELETE FROM material WHERE id = ?";
    sql = format(sql, materialId);
    return mysql.query(sql);
}

exports.update = function(name, amount, price, limit, checkLimit, units, materialType, supplier, materialId){
    var sql = "UPDATE `material` SET `name` = ?, `amount` = ?, `price` = ?, `limit` = ?, `checkLimit` = ?, `units` = ?, `materialType` = ?, `fk_Supplier` = ? WHERE `id` = ?";
    sql = format(sql, [name, amount, price, limit, checkLimit, units, materialType, supplier, materialId]);
    console.log(sql);
    return mysql.query(sql);
}

exports.getLackingMaterialsCount = function(){
    let sql = "SELECT COUNT(*) as count FROM `material` WHERE `amount` < `limit` AND `checkLimit` = 1";
    return mysql.getOne(sql);
}