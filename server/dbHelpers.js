const { models: { User} } = require('./models/index');
const axios = require('axios');
const stripe = require("stripe")(process.env.STRIPE_SECRET);

module.exports.createCustomer = ( { accounts, numbers: { ach } }, { name, id } ) => {
  stripe.customers.create({
    // set description to user acct type
    // find out where i get savings acct num
    description: name,
    // source: "tok_mastercard" // obtained with Stripe.js
  }, function (err, customer) {
    // asynchronously called
    
    User.update({
      stripe_customer: customer.id,
      accounts: mapAccounts(accounts, ach),
    }, {
      where: { id },
    });
  });
};

const mapAccounts = (accounts, ach) => {
  return accounts.reduce((accounts, { account_id, name, official_name, subtype }, index) => {
    obj = {
      account_id,
      official_name,
      subtype,
      name,
    };
    return accounts.concat([JSON.stringify(obj)])
  }, []);
};