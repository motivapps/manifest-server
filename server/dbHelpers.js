const { models: { User, Account } } = require('./models/index');
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
    }, {
      where: { id },
    });

    Account.create({
      user_id: id,
      routing: ach[0].routing,
      accounts: mapAccounts(accounts, ach),
    })

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
    return index > ach.length 
      ? accounts
      : accounts.concat([JSON.stringify(obj)]);
  }, []);
};