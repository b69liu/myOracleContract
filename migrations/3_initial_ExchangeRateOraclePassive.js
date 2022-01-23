const ExchangeRateOraclePassive = artifacts.require("ExchangeRateOraclePassive");

module.exports = function (deployer) {
  deployer.deploy(ExchangeRateOraclePassive);
};
