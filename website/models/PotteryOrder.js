const mysql = require("../tools/mysql_");
const { format } = require('mysql');


exports.save = function(comment, potteryType, amount, orderId, photoId){
    var inserts;
    var sql;
    if(photoId == ''){
        sql = "INSERT INTO `potteryorder` ( `comment`, `potteryType`, `amount`, `fk_Order`, `fk_Photo` ) VALUES ( ?, ?, ?, ?, NULL)";
        inserts = [comment, potteryType, amount, orderId];
    }else{
        sql = "INSERT INTO `potteryorder` ( `comment`, `potteryType`, `amount`, `fk_Order`, `fk_Photo` ) VALUES ( ?, ?, ?, ?, ?)";
        inserts = [comment, potteryType, amount, orderId, photoId];
    }
    sql = format(sql, inserts);
    return mysql.insert(sql);
}

exports.get = function(orderId){
    var sql = "SELECT `comment`, `amount`, potteryorder.id as id, potterytype.name as potteryType, photo.path as photo, potterytype.price as price FROM `potteryorder`\
    INNER JOIN potterytype ON potteryType = potterytype.id INNER JOIN photo ON potteryorder.fk_Photo = photo.id WHERE potteryorder.fk_Order = ?";
    sql = format(sql, orderId);
    return mysql.getOne(sql);
}