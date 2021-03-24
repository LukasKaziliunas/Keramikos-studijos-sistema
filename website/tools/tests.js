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
        var res = await User.getByEmail("jonaitis@gmail.com") 
        console.log(res);
        if(res)
        {
            console.log("yes")
        }
        else
        {
            console.log("no");
        }
    }catch(err)
    {
        console.log(err);
    }
   
    
}
/*
const x = async () => {
    const u = await User.getByEmail("jonaitis@gmail.com");
    if(u)
    return true
    else
    return false
}

const result = x();

result.then(res => console.log(res))
*/
User.getByEmail("jonaitis@gmail.com").then(res => {
    if(res)
    {
        console.log("toks yra")
    }else{
        console.log("nera")
    }
})

//test();

