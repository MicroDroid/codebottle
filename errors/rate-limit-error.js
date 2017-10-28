module.exports = function RateLimitError() {
	Error.captureStackTrace(this, this.constructor);
	this.name = this.constructor.name;
	this.message = 'Too many requests';
	this.status = 429;
};

require('util').inherits(module.exports, Error);