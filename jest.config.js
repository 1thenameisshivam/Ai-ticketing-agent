// jest.config.js
export default {
  testEnvironment: "node",
  testTimeout: 30000,
  setupFilesAfterEnv: ["<rootDir>/tests/testSetup.js"], // Test DB init
  verbose: true,
};
