const mysql = require("../tools/mysql_");
const { format } = require('mysql');

exports.getById = function(id){
    var sql = "SELECT * FROM `pottery` WHERE `id` = ?";
    sql = format(sql, id);
    return mysql.getOne(sql);
}

exports.getAll = function(){
    var sql = "SELECT * FROM `pottery`";
    return mysql.query(sql);
}

exports.getTypes = function(){
    var sql = "SELECT * FROM `potterytype`";
    return mysql.query(sql);
}

exports.save = function(name, price, amount, description, type, showInGalery){
    let sql = "INSERT INTO `pottery` (`price`, `description`, `name`, `amount`, `showInGalery`, `potteryType`, `fk_Worker`) VALUES ( ?, ?, ?, ?, ?, ?, '1');";
    var inserts = [price, description, name, amount, showInGalery, type];
    sql = format(sql, inserts);
    console.log(sql);
    return mysql.insert(sql);
}

exports.getGalleryItems = function(){
    let sql = "SELECT DISTINCT pottery.name as name, pottery.price as price, pottery.id as id, photo.path FROM pottery LEFT JOIN photo ON pottery.id = photo.fk_Pottery GROUP by id";
    return mysql.query(sql);
}


exports.getItemsPriceTotal = function(itemsArray){
    itemsArray = [itemsArray];
    let sql = "SELECT ROUND(SUM(price), 2) as total FROM pottery WHERE id IN ( ? )";
    sql = format(sql, itemsArray);
    return mysql.getOne(sql);
}

exports.changeStateOrdered = function(purchaseId, itemsArray){
    let sql ="UPDATE pottery SET state = 3, fk_PotteryPurchase = ? WHERE id IN ( ? )";
    let inserts = [purchaseId, itemsArray];
    sql = format(sql, inserts);
    return mysql.query(sql);
}
