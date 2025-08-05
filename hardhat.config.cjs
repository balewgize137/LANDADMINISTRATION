require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "HTTP://127.0.0.1:7545" // Make sure this URL matches your Ganache RPC Server
    }
  }
};