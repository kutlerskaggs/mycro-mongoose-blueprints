'use strict';

var chai = require('chai'),
    sinonchai = require('sinon-chai'),
    supertest = require('supertest');

let expect = chai.expect;

describe('basic test', function() {
    let cwd = process.cwd();

    before(function(done) {
        process.chdir(__dirname + '/../dummy');
        global.mycro = require('../dummy/app');
        mycro.start(function(err) {
            if (err) {
                return done(err);
            }
            global.request = supertest.agent(mycro.server);
            done();
        });
    });

    it('should start successfully', function(done) {
        request.get('/health')
            .set('accept-version', '^1.0.0')
            .expect(200)
            .end(done);
    });
});
