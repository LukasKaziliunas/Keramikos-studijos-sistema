

function to_basket()
{
    let basketItems = localStorage.getItem('basketItems');
    basketItems = JSON.parse(basketItems);

    let potteryString = document.getElementById("tobasket_button").value;
    let message = document.getElementById("message");
    var attributes = potteryString.split("&");
    let pottery = {
        id: attributes[0],
        name: attributes[1],
        price: attributes[2],
        photo: attributes[3]
    } 

    if(basketItems != null){
        //array not empty
        if(!checkIfInBasket(basketItems, pottery))  // does not contain this item yet
        {
            basketItems.push(pottery) 
            message.innerHTML = "dirbinys pridėtas į krepšelį";
        }else
        {
            alert("šis dirbinys jau yra jūsų krepšelyje")
        }
        
    }else{
        basketItems =  [ pottery ]
        
        message.innerHTML = "dirbinys pridėtas į krepšelį";
    }

    localStorage.setItem("basketItems", JSON.stringify(basketItems))
}

function checkIfInBasket(basket, pottery)
{
    for(let i = 0 ; i<basket.length ; i++)
    {
        if(basket[i].id == pottery.id)
        return true
    }
    return false;
}

function remove_from_basket(id)
{
    let basketItems = localStorage.getItem('basketItems');
    basketItems = JSON.parse(basketItems);
    basketItems = basketItems.filter(item => item.id != id);

    // if basket is empty, remove from local storage
    if(basketItems.length === 0){
        localStorage.removeItem('basketItems');
    }else{
        localStorage.setItem("basketItems", JSON.stringify(basketItems))
    }
    window.location.reload();
}