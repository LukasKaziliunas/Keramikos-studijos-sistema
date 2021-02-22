const mysql = require("../tools/mysql_");

exports.get = function(id){
    let query = 'SELECT * FROM `user` WHERE `id` = ' + id;
    return mysql.select(query);
}