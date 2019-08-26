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
      name: customer.description,
      userId: id,
      routing: ach[0].routing,
      accounts: mapAccounts(accounts, ach),
    })

  });
}; 

module.exports.createAccount = (authResponse, {user, account}, res) => {

  Account.update({
    account_id_to: account.account_id_to,
    account_id_from: account.account_id_from
  }, {
    where: { userId: user.id }
  });

  console.log('acc num', accIdtoNumber(account.account_id_from, authResponse))

  stripe.customers.createSource(
    user.stripe_customer,
    {
      source: {
        object: 'bank_account',
        country: 'US',
        currency: 'usd',
        account_holder_name: `${account.name}`,
        account_holder_type: 'individual',
        routing_number: `${account.routing}`,
        account_number: accIdtoNumber(account.account_id_from, authResponse),
      },
    },
    function (err, bank_account) {
      // asynchronously called
      console.log('accFROM', bank_account);
    }
  );
};

const accIdtoNumber = (id, { numbers: { ach } } ) => {
  // use ach to get real account num
  return ach.reduce((result, { account_id, account }, ind) => {
    return id === account_id 
      ? account 
      : result;
  }, '');
}

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