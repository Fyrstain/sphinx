module.exports = {
  webpack: (config) => config,
  jest: (config) => ({
    ...config,
    collectCoverageFrom: ["src/**/*.{ts,tsx,js,jsx}", "!src/**/*.test.{ts,tsx,js,jsx}"],
    coverageThreshold: {
      "./src/services/QuestionnaireResponseService.tsx": { lines: 80, branches: 80 },
      "./src/services/QuestionnaireService.tsx": { lines: 80, branches: 80 },
    },
  }),
};
