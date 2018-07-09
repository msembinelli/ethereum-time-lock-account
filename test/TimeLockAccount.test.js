const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const provider = ganache.provider();
const web3 = new Web3(provider);

const Tempo = require('@digix/tempo');
var tempo = new Tempo(web3);

const compiledTimeLockAccount = require('../ethereum/build/TimeLockAccount.json');

let accounts;
let timeLockAccount;
let timeLockAccountAddress;

beforeEach(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();

  // Use one of those accounts to deploy the contract
  timeLockAccount = await new web3.eth.Contract(JSON.parse(compiledTimeLockAccount.interface))
    .deploy({ data: compiledTimeLockAccount.bytecode })
    .send({ from: accounts[0], gas: '3000000' });

  timeLockAccount.setProvider(provider);
});

describe('Deployment', () => {
  it('deploys a TimeLockAccount', () => {
    assert.ok(timeLockAccount.options.address);
  });

  it('deposit', async () => {
    await timeLockAccount.methods.deposit(10).send({
      from: accounts[0], gas: '3000000', value: 1000000000000000000
    });

    var blockHeightStarted = parseInt(await timeLockAccount.methods.getHeightStarted().call());
    var blockHeightLock = parseInt(await timeLockAccount.methods.getLockHeight().call());

    assert.equal(blockHeightStarted + 10, blockHeightLock);
    assert.equal(await timeLockAccount.methods.getBalance().call(), 1000000000000000000);
  });

  it('withdraw', async () => {
    await timeLockAccount.methods.deposit(10).send({
      from: accounts[0], gas: '3000000', value: 1000000000000000000
    });

    var blockHeightStarted = parseInt(await timeLockAccount.methods.getHeightStarted().call());
    var blockHeightLock = parseInt(await timeLockAccount.methods.getLockHeight().call());

    assert.equal(blockHeightStarted + 10, blockHeightLock);
    assert.equal(await timeLockAccount.methods.getBalance().call(), 1000000000000000000);

    await tempo.waitUntilBlock(1000, 15);

    var balanceBefore = await web3.eth.getBalance(accounts[0]);

    await timeLockAccount.methods.withdraw().send({
      from: accounts[0], gas: '3000000'
    });

    await tempo.waitUntilBlock(1000, 20);
    var balanceAfter = await web3.eth.getBalance(accounts[0]);
    assert.ok(parseInt(balanceBefore) < parseInt(balanceAfter))
  }).timeout(10000);
});
