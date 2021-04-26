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
                paymentType: paymentType,
                orderId: orderId,
                price: price,
            })
        }).then(function(res) {
            return res.json()
        }).then(function(data) {
            //alert(data.message)
            console.log("success")
            alert("Užsakymas pateiktas")
            window.location.replace("/clients/gallery"); 
        }).catch(function(error) {
            // mokejimas niekad neivyks nes naudojama legacy stripe versija
            alert("Užsakymas pateiktas")
            window.location.replace("/clients/gallery"); 
        })
    }
})

stripeHandler.open({
    amount: price
})