'use strict';

var _ = require('lodash');

module.exports = function omitNested(obj, attrs) {
    if (!_.isArray(attrs)) {
        attrs = [attrs];
    }

    var result = _.clone(obj);
    attrs.forEach(function(attr) {
        _.unset(result, attr);
    });
    return result;
};
