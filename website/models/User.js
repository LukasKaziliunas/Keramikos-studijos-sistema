const mysql = require("../tools/mysql_");
const { format } = require('mysql');

exports.getById = function(id){
    var sql = "SELECT * FROM `user` WHERE `id` = ?";
    sql = format(sql, id);
    return mysql.get(sql);
}

exports.getByEmail = function(email){
    var sql = "SELECT * FROM `user` WHERE `email` = ?";
    sql = format(sql, email);
    return mysql.get(sql);
}

exports.save = function(email, password, type){

    let sql = "INSERT INTO `user` (`email`, `password`, `userType`) VALUES ( ? , ? , ? )";
    var inserts = [email, password, type];
    sql = format(sql, inserts);
    return mysql.insert(sql);
}