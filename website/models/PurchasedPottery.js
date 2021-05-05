const mysql = require("../tools/mysql_");
const { format } = require('mysql');
const Pottery = require("../models/Pottery");


exports.save = async function(orderId, basket){
    basket = JSON.parse(basket);
    var template = "( ?, ?, ?, ?)";
    var allValues = "";
    // ads up all values into sql string (..),(..),(..)...
    for(let i = 0; i < basket.length; i++){
       await Pottery.subtractAmount(basket[i].id, basket[i].quantity).then(()=>{
            var inserts = [orderId, basket[i].id, basket[i].quantity, basket[i].photo];
            var sqlValues = format(template, inserts);
            allValues = allValues + sqlValues;
            //ads "," if its not the last object
            if(i != basket.length -1){
                allValues = allValues + ",";
            }
        })
        .catch(err => {console.log(err); throw err})
        
    }
    let sql = "INSERT INTO `purchasedpottery` (`fk_Order`, `fk_Pottery`, `amount`, `photo`) VALUES ";
    sql = sql + allValues;
    return mysql.query(sql);
}

exports.get = function(orderId){
    var sql = "SELECT purchasedpottery.amount as amount, `photo`, purchasedpottery.id as purchaseId,\
    `fk_Pottery` as potteryId, pottery.name as name, pottery.price as price FROM `purchasedpottery` LEFT JOIN pottery ON fk_Pottery = pottery.id WHERE fk_Order = ?";
    sql = format(sql, orderId);
    console.log(sql);
    return mysql.query(sql);
}