'use strict';

var _ = require('lodash');

module.exports = function applyCriteria(query, criteria, options, cb) {
    // apply selects
    let select = _.get(criteria, 'fields.' + options.model);
    if (options.allowSelect === true && select) {
        query.select(select);
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

    if (options.include.disable !== true && _.isArray(criteria.include)) {
        criteria.include.forEach(function(relationship) {
            let shouldWhitelist = options.include.whitelist && options.include.whitelist.length,
                shouldBlacklist = !shouldWhitelist && options.include.blacklist && options.include.blacklist.length,
                include = (_.get(options.include, 'always') || []).indexOf(relationship) !== -1;

            if (shouldWhitelist) {
                if (options.include.whitelist.indexOf(relationship) !== -1) {
                    include = true;
                }
            } else if (shouldBlacklist) {
                if (options.include.blacklist.indexOf(relationship) === -1) {
                    include = true;
                }
            } else {
                include = true;
            }

            if (!include) {
                return;
            }

            let instructions = _.extend({
                path: relationship,
                options: {
                    limit: options.pageSize
                }
            }, {
                select: _.get(criteria, 'fields.' + relationship)
            });
            console.log(instructions);
            _.merge(instructions, _.get(options.include, 'options.' + relationship) || {});
            console.log(instructions);
            query.populate(instructions);
        });
    }

    cb();
};
