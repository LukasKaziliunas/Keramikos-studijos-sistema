const mysql = require("../tools/mysql_");
const { format } = require('mysql');

exports.save = function(url, potteryId){
    let sql = "INSERT INTO `photo` (`path`, `fk_Pottery`) VALUES ( ?, ? );";
    var inserts = [url, potteryId];
    sql = format(sql, inserts);
    return mysql.insert(sql);
}

exports.getPotteryPhotos = function(potteryId){
    let sql = "SELECT `id`, `path` FROM `photo` WHERE `fk_Pottery` = ?;";
    sql = format(sql, potteryId);
    return mysql.query(sql);
}