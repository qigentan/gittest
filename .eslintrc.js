module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true
  },
  extends: 'airbnb-base',
  parser: 'babel-eslint',
  plugins: [
    'babel'
  ],
  parserOptions: {
    sourceType: 'module'
  },
  globals: {
    wx: true,
    App: true,
    getCurrentPages: true,
    getApp: true,
    Page: true
  },
  rules: {
    'no-bitwise': 0,
    indent: [
      'error',
      2,
      {
        SwitchCase: 1
      }
    ],
    "import/no-extraneous-dependencies": 0,
    "import/extensions": 0,
    semi: 0,
    'spaced-comment': 0,
    'no-global-assign': 0,
    'comma-dangle': 0,
    'no-underscore-dangle': 0,
    'no-empty': ['error', {
      allowEmptyCatch: true
    }],
    'guard-for-in': 0,
    'func-names': 0,
    'max-len': ['error', {
      ignoreComments: true,
      code: 180,
      tabWidth: 2
    }],
    'no-param-reassign': 0,
    camelcase: 'warn',
    'no-plusplus': ['warn', {
      allowForLoopAfterthoughts: true
    }],
    'no-unused-vars': ['warn', {
      vars: 'local'
    }],
    'no-shadow': 'warn',
    'no-restricted-syntax': 'warn',
    'consistent-return': 0,
    'no-unused-expressions': ['error', {
      allowShortCircuit: true,
      allowTernary: true
    }],
    'no-mixed-operators': ['error', {
      allowSamePrecedence: true
    }],
    'no-return-assign': ['warn'],
    'no-use-before-define': ['error', {
      functions: false,
      classes: false
    }],
    "import/no-unresolved": ["error", { "ignore": ["./collectJSON.js", "@tuhu"] }],
    'no-prototype-builtins': 'warn',
    'no-debugger': 'warn',
    'no-console': 0,
    'no-new': 'warn',
    'class-methods-use-this': 0,
    'no-multi-assign': 'warn',
    'array-callback-return': 'warn'
  }
}
