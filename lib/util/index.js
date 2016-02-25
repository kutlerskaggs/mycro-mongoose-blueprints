'use strict';

var include = require('include-all'),
    _ = require('lodash');

let utils = include({
    dirname: __dirname + '/utils',
    filter: /(.+)\.js/
});

utils = _.mapKeys(utils, function(value, key) {
    return _.camelCase(key);
});

module.exports = utils;
