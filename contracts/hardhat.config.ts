import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'HTTP://127.0.0.1:8545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0x4d136521dfc8f5a8cb7050af601c6f6b1d0c5d861b65e8cb01fd959a96b1dfd5',
        '0x41b417d4080314a33eaac92f422faf7518f3064775bf7688427b2babb7a0b9b5',
      ]
    },
  },
};

export default config;
