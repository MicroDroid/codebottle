const redis = require('../../redis');

after(() => {
	redis.quit();
});