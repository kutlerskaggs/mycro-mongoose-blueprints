'use strict';

var omitNested = require('./omit-nested'),
    pickNested = require('./pick-nested'),
    _ = require('lodash');

module.exports = function preProcessCriteria(criteria, options, cb) {
    let shouldWhitelist = options.whitelist && options.whitelist.length,
        shouldBlacklist = shouldWhitelist ? false : (options.blacklist && options.blacklist.length);

    if (_.isPlainObject(criteria.filter)) {
        if (shouldBlacklist) {
            criteria.filter = omitNested(criteria.filter, options.blacklist);
        } else if (shouldWhitelist) {
            criteria.filter = omitNested(criteria.filter, options.whitelist);
        }
    }

    cb(null, criteria);
};
