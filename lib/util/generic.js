'use strict';

var _ = require('lodash');

module.exports = {
    omitNested(obj, attrs) {
        if (!_.isArray(attrs)) {
            attrs = [attrs];
        }

        var result = _.clone(obj);
        attrs.forEach(function(attr) {
            _.unset(result, attr);
        });
        return result;
    },

    
    pickNested(obj, attrs) {
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
    }
};
