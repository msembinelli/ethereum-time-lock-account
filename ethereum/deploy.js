const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const path = require('path');
const fs = require('fs-extra');

const config = require('./config.json');

const provider = new HDWalletProvider(
  config.provider.mnemonic,
  config.provider.url + config.provider.token
);

const compiledContractPath = './build/TimeLockAccount.json';
const compiledContract = require('./build/TimeLockAccount.json');

const web3 = new Web3(provider);

const deploy = async () => {
  // Get a list of all accounts
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  // Use one of those accounts to deploy the contract
  const result = await new web3.eth.Contract(JSON.parse(compiledContract.interface))
    .deploy({ data: compiledContract.bytecode })
    .send({ from: accounts[0], gas: '3000000' });

  // Add deploymentAddress to contract JSON file
  var data = compiledContract;
  data['deploymentAddress'] = result.options.address;
  fs.outputJsonSync(path.resolve(compiledContractPath), data, function (err) {
    if (err) {
      return console.log(err);
    }
  });

  console.log('Contract deployed to', result.options.address);
};
deploy();
