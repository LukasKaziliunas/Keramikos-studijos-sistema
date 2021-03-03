// test mysql

//const mysql = require('./mysql_');

//mysql.test();

// test models
const User = require("../models/User");
/*
async function test ()
{
    var user = await User.get(1);
    console.log(user);

}*/

async function test(){
    //var res = await User.save("jonas", "hash", "1");
    try{
        var res = await User.save('test123', "testtest ; ' \" ' ' ", 1); 
        console.log(res);
    }catch(err)
    {
        console.log(err);
    }
   
    
}

test();

