module.exports = function ApiError(status, error) {
	Error.captureStackTrace(this, this.constructor);
	this.name = this.constructor.name;
	this.message = error;
	this.status = status;
};

require('util').inherits(module.exports, Error);