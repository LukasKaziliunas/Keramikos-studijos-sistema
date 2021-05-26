const mysql = require("../tools/mysql_");
const { format } = require('mysql');

exports.save = function(material, amount, potteryOrderId){

    var sql = "INSERT INTO `potteryordermaterials` (`fk_Material`, `fk_PotteryOrder`, `amount`) VALUES ( ? , ? , ? )";
    var inserts = [material, potteryOrderId, amount];
    sql = format(sql, inserts);
    return mysql.insert(sql);
}

exports.get = function(potteryOrderId){
    var sql = "SELECT * FROM `potteryordermaterials` WHERE fk_PotteryOrder = ?";
    sql = format(sql, potteryOrderId);
    return mysql.query(sql);
}

exports.getByPotteryOrder = function(potteryOrderId){
    var sql = "SELECT potteryordermaterials.id as id, potteryordermaterials.amount as orderMaterialAmount,\
     material.name as name, material.amount as materialAmount, units.name as units, material.id as materialId \
     FROM `potteryordermaterials` INNER JOIN material ON fk_Material = material.id INNER JOIN units ON material.units = \
     units.id WHERE potteryordermaterials.fk_PotteryOrder = ?";
    sql = format(sql, potteryOrderId);
    return mysql.query(sql);
}