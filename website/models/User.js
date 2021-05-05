const mysql = require("../tools/mysql_");
const { format } = require('mysql');

exports.getById = function(id){
    var sql = "SELECT * FROM `user` WHERE `id` = ?";
    sql = format(sql, id);
    return mysql.getOne(sql);
}

exports.getByEmail = function(email){
    var sql = "SELECT * FROM `user` WHERE `email` = ?";
    sql = format(sql, email);
    return mysql.getOne(sql);
}

exports.save = function(email, password, type){

    let sql = "INSERT INTO `user` (`email`, `password`, `userType`) VALUES ( ? , ? , ? )";
    var inserts = [email, password, type];
    sql = format(sql, inserts);
    return mysql.insert(sql);
}

exports.delete = function(userId){
    var sql = "DELETE FROM `user` WHERE id = ?";
    sql = format(sql, userId);
    return mysql.query(sql);
}

exports.updatePassword = function(userId, hash){
    var sql = "UPDATE `user` SET password = ? WHERE id = ?";
    sql = format(sql, [hash, userId]);
    return mysql.query(sql);
}

exports.updateEmail = function(userId, email){
    var sql = "UPDATE `user` SET email = ? WHERE id = ?";
    sql = format(sql, [email, userId]);
    return mysql.query(sql);
}
