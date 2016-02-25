'use strict';

var _ = require('lodash');

module.exports = function pickNested(obj, attrs) {
    if (!_.isArray(attrs)) {
        attrs = [attrs];
    }

    var result = {};
    attrs.forEach(function(attr) {
        _.set(result, attr, _.get(obj, attr));
    });
    return result;
};
