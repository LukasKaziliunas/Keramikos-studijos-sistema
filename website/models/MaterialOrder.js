const mysql = require("../tools/mysql_");
const { format } = require('mysql');


exports.save = function(amount, price, orderId, materialId){
    let sql = "INSERT INTO `materialorder` (`amount`, `price`, `fk_Order`, `fk_Material`) VALUES (?, ?, ?, ?)";
    var inserts = [amount, price, orderId, materialId];
    sql = format(sql, inserts);
    return mysql.insert(sql);
}

exports.saveMultiple = function(amounts, prices, materialIds, orderId){

    var template = "(?, ?, DATE(NOW()), ?, ?)";
    var allValues = "";
    // ads up all values into sql string (..),(..),(..)...
    for(let i = 0; i < materialIds.length; i++){
        var inserts = [amounts[i], (amounts[i] * prices[i]).toFixed(2), materialIds[i], orderId];
        var sqlValues = format(template, inserts);
        allValues = allValues + sqlValues;
        //ads "," if its not the last object
        if(i != materialIds.length -1){
            allValues = allValues + ",";
        }
    }
    let sql = "INSERT INTO `materialorder` (`amount`, `price`, `date`, `fk_Material`, `orderId`) VALUES ";
    sql = sql + allValues;
    return mysql.insert(sql);
}

exports.getOrdersInfo = function(orderId){
    let sql = "SELECT material.name as name, materialorder.amount as amount, materialorder.price as price, materialorder.fk_Material as materialId FROM `materialorder` INNER JOIN material ON fk_Material = material.id WHERE `fk_Order` = ?";
    sql = format(sql, orderId);
    return mysql.query(sql);
    // returns array - [ {name, amount, price, materialId} ] 
}

exports.getSpecific = function(idArray){
    idArray = [idArray];
    let sql = "SELECT * FROM `materialorder` WHERE `id` IN (?)";
    sql = format(sql, idArray);
    return mysql.query(sql);
}

exports.getMaterialOrdersBySupplier = function(orderId, supplierId){
    var sql = "SELECT `materialorder`.`amount` as amount, materialorder.`price`, `date`, `materialorder`.`id` as id,\
    `materialorder`.`orderId` as orderId, material.name as name, units.name as units, supplier.id as supplier\
    FROM `materialorder` INNER JOIN `material` ON `fk_Material` = material.id INNER JOIN units ON material.units = units.id\
    INNER JOIN `supplier` ON material.fk_Supplier = supplier.id\
    WHERE orderId = ? AND supplier.id = ?";
    sql = format(sql, [orderId, supplierId]);
    return mysql.query(sql);
}

exports.getFilteredMaterialOrders = function(dateFrom, dateTo){
    dateFrom = dateFrom.replace("-", "").replace("-", "");
    dateTo = dateTo.replace("-", "").replace("-", "");
    var sql = 'SELECT DATE_FORMAT(date, "%Y-%m-%d") as date, materialorder.amount as amount, materialorder.price as sum, material.name as name, units.name as units FROM materialorder INNER JOIN material ON materialorder.fk_Material = material.id INNER JOIN units ON material.units = units.id WHERE date BETWEEN ? AND ? ';
    sql = format(sql, [dateFrom, dateTo]);
    return mysql.query(sql);
}