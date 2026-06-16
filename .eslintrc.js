module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier', 'react-compiler'],
  rules: {
    'prettier/prettier': 'error',
    'react-compiler/react-compiler': 'warn',
  },
};
