'use strict';

var _ = require('lodash');

module.exports = function pickNested(obj, attrs) {
    if (!_.isArray(attrs)) {
        attrs = [attrs];
    }

    var result = {};
    attrs.forEach(function(attr) {
        let value = _.get(obj, attr);
        if (value) {
            _.set(result, attr, value);
        }
    });
    return result;
};
