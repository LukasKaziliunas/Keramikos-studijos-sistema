const matterial = require("../models/Material");
const emailer = require("../tools/emails");
const materialOrder = require("../models/MaterialOrder");
/*
let a = 55.99;
let b = 22;

let c = a + b;

console.log(c.toFixed(2));

*/

//emailer.sendMaterialOrder(1);

let amounts = [ 3, 4, 3];
let prices = [ 12.66, 12, 26.99];
let id = 6;
let matIds = [ 3, 4, 9]

materialOrder.saveMultiple(amounts, prices, matIds, id);