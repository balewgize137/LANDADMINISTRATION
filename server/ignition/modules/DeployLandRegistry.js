const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
module.exports = buildModule("FinalLandRegistryModule", (m) => { // Using a new name
  const landRegistry = m.contract("LandRegistry", []);
  return { landRegistry };
});