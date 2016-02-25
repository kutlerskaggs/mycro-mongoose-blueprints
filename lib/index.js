'use strict';

module.exports = function mycro_mongoose_blueprints(done) {
    let mycro = this;

    if (!mycro.services) {
        return done('[mycro-mongoose-blueprints] requires the `services` hook to have been run');
    }

    mycro.services.mongoose = require('./services/mongoose')(mycro);
    done();
};
