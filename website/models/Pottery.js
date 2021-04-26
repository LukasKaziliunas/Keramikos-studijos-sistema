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

exports.getTypePrice = function(typeId){
    var sql = "SELECT price FROM `potterytype` WHERE id = ?";
    sql = format(sql, typeId);
    return mysql.getOne(sql);
}

exports.save = function(name, price, amount, description, type, showInGallery){
    let sql = "INSERT INTO `pottery` (`price`, `description`, `name`, `amount`, `showInGalery`, `potteryType`, `fk_Worker`) VALUES ( ?, ?, ?, ?, ?, ?, '1');";
    var inserts = [price, description, name, amount, showInGallery, type];
    sql = format(sql, inserts);
    return mysql.insert(sql);
}

exports.getGalleryItems = function(){
    let sql = "SELECT DISTINCT pottery.name as name, pottery.price as price, pottery.amount as amount, pottery.id as id, photo.path FROM pottery  LEFT JOIN photo ON pottery.id = photo.fk_Pottery WHERE showInGalery = 1 GROUP by id ";
    return mysql.query(sql);
}

exports.getListItems = function(){
    let sql = "SELECT DISTINCT pottery.name as name, pottery.price as price, pottery.amount as amount, pottery.description as description, pottery.showInGalery as showInGallery, pottery.id as id, potterytype.name as type, photo.path FROM pottery LEFT JOIN photo ON pottery.id = photo.fk_Pottery INNER JOIN potterytype ON potterytype.id = pottery.potteryType GROUP by id";
    return mysql.query(sql);
}


exports.getItemsPriceTotal = function(itemsArray){
    itemsArray = [itemsArray];
    let sql = "SELECT ROUND(SUM(price), 2) as total FROM pottery WHERE id IN ( ? )";
    sql = format(sql, itemsArray);
    return mysql.getOne(sql);
}

exports.delete = function(potteryId){
    let sql = "DELETE FROM pottery WHERE id = ?";
    sql = format(sql, potteryId);
    return mysql.query(sql);
}

exports.subtractAmount = function(potteryId, quantity){
    let sql = "UPDATE `pottery` SET `amount` = `amount` - ? WHERE id = ?";
    sql = format(sql, [quantity, potteryId]);
    return mysql.query(sql);
}

exports.update = function(name, price, amount, description, type, showInGallery, potteryId){
    let sql = "UPDATE `pottery` SET `name` = ?, `price` = ?, `description` = ?, `amount` = ?, `showInGalery` = ?, `potteryType` = ? WHERE `id` = ?"
    sql = format(sql, [name, price, description, amount, showInGallery, type, potteryId])
    console.log(sql);
    return mysql.query(sql);
}
