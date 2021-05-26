const mysql = require("../tools/mysql_");
const { format } = require('mysql');

exports.getDeliveryTypes = function(){
    let sql = "SELECT * FROM deliverytype";
    return mysql.query(sql);
}

exports.save = function(sum, city, address, postalCode, state, orderType, deliverytype, clientId, phone){
    let sql = "INSERT INTO `order` (`date`, `sum`, `city`, `address`, `postalCode`, `state`, `orderType`, `deliverytype`, `fk_Client`, `phone`) VALUES (DATE(NOW()), ?, ?, ?, ?, ?, ?, ?, ?, ? )";
    var inserts = [sum, city, address, postalCode, state, orderType, deliverytype, clientId, phone];
    sql = format(sql, inserts);
    return mysql.insert(sql);
}

exports.getById = function(id){
    var sql = "SELECT * FROM `order` WHERE `id` = ?";
    sql = format(sql, id);
    return mysql.getOne(sql);
}

exports.getFilteredOrders = function(dateFrom, dateTo){
    dateFrom = dateFrom.replace("-", "").replace("-", "");
    dateTo = dateTo.replace("-", "").replace("-", "");
    var sql = 'SELECT `order`.id as id, DATE_FORMAT(date, "%Y-%m-%d") as date, sum, ordertype.name as orderType FROM `order` INNER JOIN ordertype ON ordertype = ordertype.id WHERE date BETWEEN ? AND ? AND state = 2';
    sql = format(sql, [dateFrom, dateTo]);
    return mysql.query(sql);
}

//id date sum city address postalCode orderState deliveryType orderType orderTypeId clientName clientLName phone
exports.getFullOrderDetails = function(filter, page){
    var where = "";
    var offset = 0;
    if(page > 0){
        offset  = page * 3;   
    }

    if(filter == 0){
        //all
        where = "ORDER BY orderstate.id, date DESC LIMIT 3 OFFSET ?"
    }else if(filter == 1){
        //new
        where = "WHERE state = 1 ORDER BY date DESC LIMIT 3 OFFSET ?"
    }else if(filter == 2){
        //done
        where = "WHERE state = 2 ORDER BY date DESC LIMIT 3 OFFSET ?"
    }else if (filter == 3){
        //canceled
        where = "WHERE state = 3 ORDER BY date DESC LIMIT 3 OFFSET ?"
    }else if(filter == 4){
        //individual
        where = "WHERE orderType = 1 ORDER BY orderstate.id, date DESC LIMIT 3 OFFSET ?";
    }else if(filter == 5){
        //purchase
        where = "WHERE orderType = 2 ORDER BY orderstate.id, date DESC LIMIT 3 OFFSET ?";
    }else{
        where = "ORDER BY orderstate.id, date DESC LIMIT 3 OFFSET ?"
    }
    where = format(where, offset);
    let sql = "SELECT  `order`.`id` , DATE_FORMAT(`order`.date, '%Y-%m-%d') as date, `order`.`sum` as sum, `city`, `address`,\
    `postalCode`, orderstate.name as orderState,    deliverytype.name as deliveryType, ordertype.name as orderType, ordertype.id as orderTypeId,\
    IFNULL(client.name, 'kliento paskyra uždaryta') as clientName,    client.lastname as clientLName, `order`.phone as phone,\
    IF(payment.id is null, 'neatlikta', 'atlikta') as paymentMade\
    FROM `order` INNER JOIN orderstate ON state = orderstate.id INNER JOIN deliverytype ON deliveryType = deliverytype.id\
    INNER JOIN ordertype ON orderType = ordertype.id    LEFT JOIN client ON fk_Client = client.id\
    LEFT JOIN payment ON payment.fk_Order = `order`.`id` " + where;
    return mysql.query(sql);
}

exports.getFullOrderDetailsById = function(id){
    var sql = "SELECT	`order`.`id` ,DATE_FORMAT(`order`.date, '%Y-%m-%d') as date, `order`.`sum`, `city`, `address`, `postalCode`, orderstate.name as orderState,\
    deliverytype.name as deliveryType, ordertype.name as orderType, ordertype.id as orderTypeId, IFNULL(client.name, 'kliento paskyra uždaryta') as clientName,\
    client.lastname as clientLName, `order`.phone as phone, IF(payment.id is null, 'neatlikta', 'atlikta') as paymentMade\
    FROM `order` INNER JOIN orderstate ON state = orderstate.id\
    INNER JOIN deliverytype ON deliveryType = deliverytype.id INNER JOIN ordertype ON orderType = ordertype.id\
    LEFT JOIN client ON fk_Client = client.id LEFT JOIN payment ON payment.fk_Order = `order`.`id` WHERE `order`.`id` = ?";
    sql = format(sql, id);
    return mysql.query(sql);
}

exports.updateState = function(id, state){
    var sql = "UPDATE `order` SET state = ? WHERE id = ?";
    sql = format(sql, [state, id]);
    return mysql.query(sql);
}

exports.getClientOrders = function(clientId){
    var sql = "SELECT `order`.id as id, DATE_FORMAT(`order`.date, '%Y-%m-%d') as date, `order`.sum, IFNULL(paymenttype.name, \
        'mokėjimas nepasirinktas arba neatliktas')  as paymentType,    IF(orderstate.name = 'naujas', 'pateiktas', orderstate.name) as orderState, ordertype.name as orderType,\
        orderType as orderTypeId FROM `order` LEFT JOIN payment    ON `order`.`id` = payment.fk_Order LEFT JOIN paymenttype \
        ON payment.paymentType = paymenttype.id INNER JOIN orderstate    ON `order`.state = orderstate.id INNER JOIN ordertype ON \
        `order`.`orderType` = ordertype.id WHERE `order`.`fk_Client` = ? ORDER BY date DESC";
    sql = format(sql, clientId);
    return mysql.query(sql);
}

exports.getNewOrdersCount = function(){
    var sql = "SELECT COUNT(*) as count FROM `order` WHERE state = 1";
    return mysql.getOne(sql);
}