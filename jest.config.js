// jest.config.js
export default {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/testSetup.js"], // Test DB init
  verbose: true,
};
