const mysql = require("../tools/mysql_");
const { format } = require('mysql');

exports.save = function(name, lastname, phone, userId){

    let sql = "INSERT INTO `client` ( `id`, `name`, `lastname`, `phone`, `fk_User`) VALUES ( ?, ? , ?, ?, ? )";
    var inserts = [userId, name, lastname, phone, userId];
    sql = format(sql, inserts);
    return mysql.insert(sql);
}

exports.getById = function(id){
    var sql = "SELECT * FROM `client` WHERE `id` = ?";
    sql = format(sql, id);
    return mysql.getOne(sql);
}

exports.update = function(name, lastname, phone, userId){
    var sql = "UPDATE `client` SET `name` = ?, `lastname` = ?, `phone` = ? WHERE `id` = ?";
    let includes = [name, lastname, phone, userId];
    sql = format(sql, includes);
    return mysql.query(sql);
}

exports.getClients = function(id, name, lname, phone, page){

    phone = phone.replace(" ", "+");
    var sql = "SELECT user.id as id, email, client.name as name, client.lastname as lastname, client.phone as phone FROM `user` INNER JOIN client ON `user`.id = client.fk_User"
    var finalFilter = "";
    var offset = 0;
    if(page > 0){
        offset  = page * 5;   
    }

    var filters = [];

    var limit = " LIMIT 5 OFFSET ?";
    limit = format(limit, offset);

    if(id != ''){
        var idFilter = format(" user.id = ?", id);
        filters.push(idFilter);
    }

    if(name != ''){
        var nameFilter = format(" name = ?", name);
        filters.push(nameFilter);
    }

    if(lname != ''){
        var lnameFilter = format(" lastname = ?", lname);
        filters.push(lnameFilter);
    }

    if(phone != ''){
        var phoneFilter = format(" phone = ?", phone);
        filters.push(phoneFilter);
    }
    let l = filters.length;
    if( l > 0){
        finalFilter = finalFilter + " WHERE"; 
        for(let i = 0;  i < l; i++){
            finalFilter = finalFilter + filters[i];
            if( l - 1 != i){
                finalFilter = finalFilter + " AND";
            }
        }
    }

    finalFilter = finalFilter + limit;
    sql = sql + finalFilter;
    return mysql.query(sql);
}