const PassiveOracleUser = artifacts.require("PassiveOracleUser");

module.exports = function (deployer) {
  deployer.deploy(PassiveOracleUser);
};
