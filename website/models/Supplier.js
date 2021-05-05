const mysql = require("../tools/mysql_");
const { format } = require('mysql');

exports.getById = function(id){
    var sql = "SELECT * FROM `supplier` WHERE `id` = ?";
    sql = format(sql, id);
    return mysql.getOne(sql);
}

exports.getAll = function(){
    var sql = "SELECT * FROM `supplier`";
    return mysql.query(sql);
}

exports.save = function(name, email, phone){

    var sql = "INSERT INTO `supplier` (`name`, `email`, `phone`) VALUES ( ? , ? , ? )";
    var inserts = [name, email, phone];
    sql = format(sql, inserts);
    return mysql.insert(sql);
}

exports.update = function(name, email, phone, supplierId){
    var sql = "UPDATE `supplier` SET name = ?, email = ?, phone = ? WHERE `id` = ?";
    var inserts = [name, email, phone, supplierId];
    sql = format(sql, inserts);
    return mysql.query(sql);
}

exports.delete = function(userId){
    var sql = "DELETE FROM `supplier` WHERE id = ?";
    sql = format(sql, userId);
    return mysql.query(sql);
}
