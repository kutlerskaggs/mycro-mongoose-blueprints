'use strict';

var _ = require('lodash');

module.exports = function applyCriteria(query, criteria, options, cb) {
    // apply selects
    if (criteria.select) {
        query.select(criteria.select);
    }

    // apply limit
    let limit = _.get(criteria, 'page.size');
    if (limit) {
        query.limit(limit);
        let skip = parseInt(_.get(criteria, 'page.number'));
        if (isNaN(skip)) {
            skip = 1;
        }
        query.skip(skip - 1);
    }
    cb();
};
