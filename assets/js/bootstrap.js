import root from 'window-or-global';

// Will be replaced by server entry later, just to prevent undef errors
if (typeof(window) === 'undefined')
	root.location = {
		protocol: 'https:',
		hostname: 'codebottle.io'
	};

root.hljs = require('highlight.js/lib/highlight');

const hljsLanguages = ['java', 'cpp', 'cs', 'python', 'php', 'javascript', 'perl', 'ruby', 'powershell', 'lua', 'json'];

hljsLanguages.forEach((langName) => {
	const langModule = require(`highlight.js/lib/languages/${langName}`);
	root.hljs.registerLanguage(langName, langModule);
});

root.marked = require('marked');

root.moment = require('moment-mini');

root.axios = require('axios');
root.axios.defaults.headers.common = {
	'Accept': 'application/vnd.codebottle.v1+json',
};
