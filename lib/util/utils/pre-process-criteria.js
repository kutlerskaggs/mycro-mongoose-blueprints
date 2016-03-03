'use strict';

var omitNested = require('./omit-nested'),
    pickNested = require('./pick-nested'),
    _ = require('lodash');

module.exports = function preProcessCriteria(criteria, options, cb) {
    console.log(criteria);
    let shouldWhitelist = options.filter.whitelist && options.filter.whitelist.length,
        shouldBlacklist = shouldWhitelist ? false : (options.filter.blacklist && options.filter.blacklist.length);

    if (_.isPlainObject(criteria.filter)) {
        if (shouldBlacklist) {
            criteria.filter = omitNested(criteria.filter, options.filter.blacklist);
        } else if (shouldWhitelist) {
            criteria.filter = pickNested(criteria.filter, options.filter.whitelist);
        }
    }

    console.log(criteria);
    cb();
};
