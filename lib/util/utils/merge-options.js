'use strict';

var _ = require('lodash');

module.exports = function(req, options) {
    let _options = _.clone(options);
    _.merge(options, req.options, _options);
    _.defaults(options, {
        pageSize: 10,
        pageSizeMin: 1,
        pageSizeMax: 100
    });
};
