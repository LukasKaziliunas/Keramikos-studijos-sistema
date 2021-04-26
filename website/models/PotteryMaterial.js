const mysql = require("../tools/mysql_");
const { format } = require('mysql');

exports.save = function(material, amount, potteryId){

    let sql = "INSERT INTO `potterymaterial` (`fk_Material`, `fk_Pottery`, `amount`) VALUES ( ? , ? , ? )";
    var inserts = [material, potteryId, amount];
    sql = format(sql, inserts);
    return mysql.insert(sql);
}

exports.getByPottery = function(potteryId){
    let sql = "SELECT potterymaterial.id as id, potterymaterial.amount as potteryMaterialAmount,\
    material.name as name, material.amount as materialAmount, units.name as units,\
    material.id as materialId FROM `potterymaterial` INNER JOIN material ON fk_Material = material.id\
    INNER JOIN units ON material.units = units.id WHERE potterymaterial.fk_Pottery = ?";
    sql = format(sql, potteryId);
    return mysql.query(sql);
}

exports.delete = function(id, materialId, amount){
    let sql = "UPDATE `material` SET amount = amount + ? WHERE id = ?; DELETE FROM `potterymaterial` WHERE id = ?";
    sql = format(sql, [amount, materialId, id]);
    return mysql.query(sql);
}