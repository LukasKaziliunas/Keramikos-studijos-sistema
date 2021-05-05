var email = require("../tools/emails")

var orders =
[
    {
      amount: 1,
      price: 6,
      date: '2021-05-01T21:00:00.000Z',
      id: 46,
      orderId: '2fa02263-a713-4aab-990d-8710f126ad2f',
      name: 'SLA 306 oranžinė',
      units: 'kg',
      supplier: 1
    }
  ]

  email.sendMaterialOrder(orders, 100, "kaziliunaslukas@gmail.com");

/*
let a = 55.99;
let b = 22;

let c = a + b;

console.log(c.toFixed(2));

*/

//emailer.sendMaterialOrder(1);

