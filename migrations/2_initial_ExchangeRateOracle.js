const ExchangeRateOracle = artifacts.require("ExchangeRateOracle");

module.exports = function (deployer) {
  deployer.deploy(ExchangeRateOracle);
};
