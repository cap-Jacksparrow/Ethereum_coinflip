const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Ganache host
      port: 8545,        // Ganache port
      network_id: "*",   // Match any network id
    },
  },
  compilers: {
    solc: {
      version: "0.8.18", // Your Solidity version
    }, 
  },
};