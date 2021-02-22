// test mysql

//const mysql = require('./mysql_');

//mysql.test();

// test models
const User = require("../models/User");

async function test ()
{
    var user = await User.get(1);
    console.log(user);

}

test();

