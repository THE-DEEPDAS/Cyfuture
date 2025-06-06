export default {
  testEnvironment: "node",
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest",
  },
  testTimeout: 60000,
};
