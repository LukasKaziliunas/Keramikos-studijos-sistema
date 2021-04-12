var stripeHandler = StripeCheckout.configure({
    key: stripePublicKey,
    locale: 'auto',
    token: function(token) {

        fetch('/orders/purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                stripeTokenId: token.id,
                items: itemsList,
                paymentType: paymentType,
                orderId: orderId,
                price: price,
                orderType: orderType
            })
        }).then(function(res) {
            return res.json()
        }).then(function(data) {
            alert(data.message)
        }).catch(function(error) {
            // mokejimas niekad neivyks nes naudojama legacy stripe versija
            alert("Užsakymas pateiktas")
            window.location.replace("/clients/gallery"); 
        })
        localStorage.removeItem('basketItems');
    }
})

stripeHandler.open({
    amount: price
})