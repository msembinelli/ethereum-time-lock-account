import web3 from './web3';
import TimeLockAccount from './build/TimeLockAccount.json';

const instance = new web3.eth.Contract(
  JSON.parse(TimeLockAccount.interface),
  TimeLockAccount.deploymentAddress
);

export default instance;