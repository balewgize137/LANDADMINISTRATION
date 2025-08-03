const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("LandRegistryModuleV2", (m) => {
  const landRegistry = m.contract("LandRegistry", []);
  return { landRegistry };
});


