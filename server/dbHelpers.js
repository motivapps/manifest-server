const { models: { User} } = require('./models/index');
const axios = require('axios');
const stripe = require("stripe")(process.env.STRIPE_SECRET);

module.exports.createCustomer = ( { accounts }, { name, id } ) => {
  stripe.customers.create({
    // set description to user acct type
    // find out where i get savings acct num
    description: name,
    // source: "tok_mastercard" // obtained with Stripe.js
  }, function (err, customer) {
    // asynchronously called
    
    User.update({
      stripe_customer: customer.id,
      accounts: mapAccounts(accounts),
    }, {
      where: { id },
    });
  });
};

const mapAccounts = (array) => {
  return array.reduce((array, { account_id, name, official_name, subtype }) => {
    obj = {
      account_id,
      official_name,
      subtype,
      name,
    };
    return array.concat([JSON.stringify(obj)])
  }, []);
};