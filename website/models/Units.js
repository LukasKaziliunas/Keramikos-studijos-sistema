const mysql = require("../tools/mysql_");
const { format } = require('mysql');

exports.getUnits = function()
{
    var sql = "SELECT * FROM `units`";
    return mysql.query(sql);
}