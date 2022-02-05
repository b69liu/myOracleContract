const MyRandom = artifacts.require("MyRandom");

module.exports = function (deployer) {
  deployer.deploy(MyRandom);
};
