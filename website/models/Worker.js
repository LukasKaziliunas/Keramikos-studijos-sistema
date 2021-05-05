const mysql = require("../tools/mysql_");
const { format } = require('mysql');

exports.save = function(name, userId){

    let sql = "INSERT INTO `worker` (`name`, `id`, `fk_User`) VALUES ( ? , ? , ? )";
    var inserts = [name, userId, userId];
    sql = format(sql, inserts);
    return mysql.insert(sql);
}