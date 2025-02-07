module.exports = {
  presets: ['@babel/env', '@babel/react'],
  plugins: ['@babel/plugin-transform-runtime'],
  env: {
    componentTest: {
      plugins: ['istanbul'],
    },
  },
};
