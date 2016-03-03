'use strict';

var async = require('async'),
    util = require('../util'),
    _ = require('lodash');

module.exports = function(mycro) {
    return {
        create(req, options, cb) {

        },


        find(req, options, cb) {
            let mycro = req.mycro;

            if (_.isFunction(options)) {
                cb = options;
                options = {};
            }
            util.mergeOptions(req, options);

            async.auto({
                model: function parseModel(fn) {
                    util.parseModel(req, options, fn);
                },

                criteria: function parseCriteria(fn) {
                    util.parseCriteria(req, options, fn);
                },

                preProcessCriteria: ['criteria', function preProcessCriteria(fn, r) {
                    util.preProcessCriteria(r.criteria, options, fn);
                }],

                processCriteria: ['preProcessCriteria', function processCriteria(fn, r) {
                    if (!_.isFunction(options.processCriteria)) {
                        return fn();
                    }
                    options.processCriteria(r.criteria, fn);
                }],

                query: ['model', 'processCriteria', function instantiateQuery(fn, r) {
                    let query = r.model.find(r.criteria.filter || {});
                    fn(null, query);
                }],

                applyCriteria: ['processCriteria', function applyCriteria(fn, r) {
                    util.applyCriteria(r.query, r.criteria, options, fn);
                }],

                processQuery: ['applyCriteria', function processQuery(fn, r) {
                    if (!_.isFunction(options.processQuery)) {
                        return fn();
                    }
                    options.processQuery(r.query, fn);
                }],

                data: ['processQuery', function execQuery(fn, r) {
                    r.query.exec(fn);
                }]
            }, function(err, r) {
                if (err) {
                    return cb(err);
                }
                cb(null, r.data);
            });
        },


        findOne(req, options, cb) {

        },


        remove(req, options, cb) {

        },


        update(req, options, cb) {

        }
    };
};
