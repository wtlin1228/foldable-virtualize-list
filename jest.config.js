export default {
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
  },
  testEnvironment: "node", // or 'jsdom' if you're testing in browser-like environment
};
