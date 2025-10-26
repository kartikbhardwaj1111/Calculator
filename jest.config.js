module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'json'],
  testMatch: ['**/__tests__/**/*.(js|jsx)', '**/*.(test|spec).(js|jsx)'],
  collectCoverageFrom: [
    'utils/**/*.{js,jsx}',
    'components/**/*.{js,jsx}',
    '!**/node_modules/**',
  ],
};