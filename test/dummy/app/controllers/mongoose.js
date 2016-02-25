'use strict';

var async = require('async'),
    _ = require('lodash');

module.exports = {
    find(req, res) {
        let mycro = req.mycro;
        mycro.services.mongoose.find(req, function(err, data) {
            if (err) {
                return res.json(500, err);
            }
            res.json(200, data);
        });
    }
};
