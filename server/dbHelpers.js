const axios = require('axios');
const stripe = require("stripe")(process.env.STRIPE_SECRET);



module.exports.createCustomer = ( bankInfo, user ) => {
  stripe.customers.create({
    // set description to user acct type
    // find out where i get savings acct num
    description: 'Customer for jenny.rosen@example.com',
    source: "tok_mastercard" // obtained with Stripe.js
  }, function (err, customer) {
    // asynchronously called
  });
};