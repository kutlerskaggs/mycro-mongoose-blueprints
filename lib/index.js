'use strict';

var _ = require('lodash');

module.exports = function mycro_mongoose_blueprints(done) {
    let mycro = this;
    if (!mycro.services) {
        return done(new Error('[hook] mycro-mongoose-blueprints requires the `services` hook'));
    }

    let BlueprintService = require('./services/mongoose')(mycro),
        config = _.get(mycro._config, 'mongoose-blueprints') || {};

    let service = new BlueprintService(config);
    mycro.services.mongoose = service;
    done();
};
