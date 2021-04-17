

function to_basket()
{
    let basketItems = localStorage.getItem('basketItems');
    basketItems = JSON.parse(basketItems);
    
    let potteryString = document.getElementById("tobasket_button").value;
    let quantity = document.getElementById("quantity").value;
    let inStock = document.getElementById("span-amount").innerHTML;
    let message = document.getElementById("message");
    var attributes = potteryString.split("&");
    let pottery = {
        id: attributes[0],
        name: attributes[1],
        price: attributes[2],
        photo: attributes[3],
        quantity: quantity,
        inStock: inStock
    } 

    if(basketItems != null){
        //array not empty
        if(!checkIfInBasket(basketItems, pottery))  // does not contain this item yet
        {
            basketItems.push(pottery) 
            message.innerHTML = `<div class="alert alert-info" role="alert">
                                    dirbinys pridėtas į krepšelį
                                </div>`;
        }else
        {
            message.innerHTML = `<div class="alert alert-danger" role="alert">
                                    dirbinys jau yra krepšelyje  
                                </div>`;
        }
        
    }else{
        basketItems =  [ pottery ]
        
        message.innerHTML = `<div class="alert alert-info" role="alert">
                                    dirbinys pridėtas į krepšelį
                                </div>`;
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

function updateItemTotal(id, price, quantityInputId, itemTotalId){
    let itemQuantity = document.getElementById(quantityInputId).value;
    let itemTotalDOM = document.getElementById(itemTotalId);
    let itemTotal = price * itemQuantity;
    itemTotalDOM.innerHTML = itemTotal;
    updateBasketItemQty(id, itemQuantity);
}

function updateBasketItemQty(id, qty){
    let basketItems = localStorage.getItem('basketItems');
    basketItems = JSON.parse(basketItems);
    for(let i = 0; i < basketItems.length; i++)
    {
        if(basketItems[i].id == id){
            basketItems[i].quantity = qty;
        }
    }
    localStorage.setItem("basketItems", JSON.stringify(basketItems));
    calculateTotal();
}

function calculateTotal()
{
    var itemsTotals = document.getElementsByClassName('itemsTotals');
    var total = 0;
    for (var i = 0; i < itemsTotals.length; ++i) {
        var itemTotal = itemsTotals[i].innerHTML;
        total += itemTotal * 1; //turn into a number and add to total
    }
    let totalValue = document.getElementById("totalValue");
    totalValue.innerHTML = total;
}

function submitOrder(){
    let totalValue = document.getElementById("totalValue");
    let total = totalValue.innerHTML;
    location.replace(`/orders/orderConfirmForm?total=${total}&orderType=2`)

}