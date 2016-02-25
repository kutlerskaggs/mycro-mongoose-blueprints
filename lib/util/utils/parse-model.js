'use strict';

var _ = require('lodash');

module.exports = function parseModel(req, options, cb) {
    let modelName = options.model;
    if (!modelName) {
        return cb({
            status: 500,
            title: 'Missing required `model` options',
            detail: 'No `model` option specified on the request or in options'
        });
    }
    let model = _.get(req, 'mycro.models.' + modelName);
    if (!model) {
        return cb({
            status: 500,
            title: 'Missing model',
            detail: 'Unable to locate model with name `' + modelName + '`'
        });
    }
    cb(null, model);
};
