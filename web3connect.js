import Web3 from 'web3';
import CoinFlip from './CoinFlip.json';

const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");

const contractAddress = '0x10a29B9CC71e344cCFFB4e35f66DD64DC63947bb';
const contract = new web3.eth.Contract(CoinFlip.abi, contractAddress);

export { contract,web3 };
