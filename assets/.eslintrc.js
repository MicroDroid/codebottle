module.exports = {
    "env": {
        "browser": true,
        "node": false,
        "commonjs": true,
        "es6": true
    },

    "extends": [
        "plugin:vue/recommended"
    ],

    "parserOptions": {
        "sourceType": "module"
    },

    "rules": {
        "require-atomic-updates": ["error"],

        // We're using vue/*-indent instead
        "indent": "off",

        "vue/script-indent": [
            "error",
            "tab",
            {"baseIndent": 1}
        ],
        "vue/html-indent": [
            "error",
            "tab",
		],
		"vue/max-attributes-per-line": [2, {
			"singleline": 4,
			"multiline": {
				"max": 4,
				"allowFirstLine": true,
			}
		}],

        "vue/order-in-components": "off"
    },

    "globals": {
        "axios": "readonly",
        "process": "readonly",
        "$": false
    }
};

