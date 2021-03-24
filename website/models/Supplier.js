const mysql = require("../tools/mysql_");
const { format } = require('mysql');

exports.getById = function(id){
    var sql = "SELECT * FROM `supplier` WHERE `id` = ?";
    sql = format(sql, id);
    return mysql.get(sql);
}

exports.getAll = function(){
    var sql = "SELECT * FROM `supplier`";
    return mysql.query(sql);
}

exports.getAllCompact = function(){
    var sql = "SELECT `id`, `name` FROM `supplier`";
    return mysql.query(sql);
}

exports.save = function(name, email, phone){

    let sql = "INSERT INTO `supplier` (`name`, `email`, `phone`) VALUES ( ? , ? , ? )";
    var inserts = [name, email, phone];
    sql = format(sql, inserts);
    return mysql.insert(sql);
}