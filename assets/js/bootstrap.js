window._ = require('lodash');
window.hljs = require('highlight.js/lib/highlight');

const hljsLanguages = ['java', 'cpp', 'cs', 'python', 'php', 'javascript', 'perl', 'ruby', 'powershell', 'lua', 'json'];

hljsLanguages.forEach((langName) => {
	const langModule = require(`highlight.js/lib/languages/${langName}`);
	window.hljs.registerLanguage(langName, langModule);
});

window.marked = require('marked');

window.$ = window.jQuery = require('jquery');

window.pace = require('pace-progress');
window.pace.start();

window.moment = require('moment-mini');

window.axios = require('axios');
window.axios.defaults.headers.common = {
	'Accept': 'application/vnd.codebottle.v1+json',
};
