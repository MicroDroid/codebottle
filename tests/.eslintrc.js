module.exports = {
  "plugins": [
    "mocha"
  ],

  "rules": {
    "require-atomic-updates": ["error"],

    "mocha/no-exclusive-tests": "error"
  },

  "env": {
  	"mocha": true,
  }
}