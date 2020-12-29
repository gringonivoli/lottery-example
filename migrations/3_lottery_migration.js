const Lottery = artifacts.require("Lottery");
const defaultName = 'Sorteo';
const defaultAddress = '0x29D7d1dd5B6f9C864d9db560D72a247c178aE86B';

module.exports = function (deployer) {
    deployer.deploy(Lottery, defaultName, defaultAddress);
};
