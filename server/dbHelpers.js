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
      name: customer.name,
      userId: id,
      routing: ach[0].routing,
      accounts: mapAccounts(accounts, ach),
    })

  });
}; 

module.exports.createAccount = (authResponse, {user, account}, res) => {
  stripe.customers.createSource(
    `${user.stripe_customer}`,
    {
      source: {
        object: 'bank_account',
        country: 'United States',
        currency: 'USD',
        account_holder_name: `${account.name}`,
      },
    },
    function (err, bank_account) {
      // asynchronously called
    }
  );
};

const mapAccounts = (accounts, ach) => {
  return accounts.reduce((accounts, { account_id, name, official_name, subtype }, index) => {
    obj = {
      account_id,
      official_name,
      subtype,
      name,
    };
    return index > ach.length - 1 
      ? accounts
      : accounts.concat([JSON.stringify(obj)]);
  }, []);
};