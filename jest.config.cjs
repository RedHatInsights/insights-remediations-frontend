// jest.config.cjs
const pfPkgs =
  '@patternfly/react-(core|icons|styles|table)|' +           // PF v5 packages
  'uuid|p-all|p-map|aggregate-error|indent-string|clean-stack';

module.exports = {
  /* Environment --------------------------------------------------- */
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
  /* Transforms ---------------------------------------------------- */
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',          // reuse your Babel config
  },
  // Don’t ignore PF v5 (needs transpile)
  transformIgnorePatterns: [`/node_modules/(?!(${pfPkgs})/)`],

  /* Asset & path stubs ------------------------------------------- */
  moduleNameMapper: {
    '\\.(css|scss|svg)$': 'identity-obj-proxy',  // kills the “Unexpected token '.' ”
  },
};
