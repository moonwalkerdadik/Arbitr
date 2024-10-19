const Arbitration = artifacts.require("Arbitration");

module.exports = function (deployer) {
  deployer.deploy(Arbitration);
};
