const mysql = require("../tools/mysql_");
const { format } = require('mysql');

exports.save = function(url, potteryId){
    var sql = "";
    if(potteryId == -1){
        sql = "INSERT INTO `photo` (`path`, `fk_Pottery`) VALUES ( ?, NULL );";
        sql = format(sql, url);
    }else{
        sql = "INSERT INTO `photo` (`path`, `fk_Pottery`) VALUES ( ?, ? );";
        var inserts = [url, potteryId];
        sql = format(sql, inserts);
    }
    return mysql.insert(sql);
}

exports.getPotteryPhotos = function(potteryId){
    let sql = "SELECT `id`, `path` FROM `photo` WHERE `fk_Pottery` = ?;";
    sql = format(sql, potteryId);
    return mysql.query(sql);
}

exports.getOnePhoto = function(potteryId){
    let sql = "SELECT * FROM `photo` WHERE photo.fk_Pottery = ? LIMIT 1";
    sql = format(sql, potteryId);
    return mysql.getOne(sql);
}

exports.getDistinctPhotos = function(potteryType){
    var filter = "";
    if(potteryType != 0){
        filter = " WHERE pottery.potteryType = ? ";
        filter = format(filter, potteryType);
    }
    let sql = `SELECT photo.id, photo.path, photo.fk_Pottery as potteryId FROM photo INNER JOIN pottery ON photo.fk_Pottery = pottery.id ${filter} GROUP BY photo.fk_Pottery`;
    return mysql.query(sql);
}

exports.removePhotoFromPottery = function(photoId){
    let sql = "UPDATE `photo` SET fk_Pottery = NULL WHERE id = ?";
    sql = format(sql, photoId);
    return mysql.query(sql);
}