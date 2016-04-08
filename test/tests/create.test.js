'use strict';

var async = require('async'),
    expect = require('chai').expect,
    faker = require('faker'),
    sinon = require('sinon'),
    _ = require('lodash');

describe('create', function() {
    let defaultHeaders = { 'accept-version': '^1.0.0' }, kanye;

    before(function(done) {
        mycro.models.user.findOne({
            email: 'kwest@example.com'
        }, function(err, user) {
            kanye = user;
            _.merge(defaultHeaders, {'x-user-id': kanye.id});
            done(err);
        });
    });

    it('should succeed (201)', function(done) {
        request.post('/api/users')
            .set(defaultHeaders)
            .send({
                data: {
                    type: 'user',
                    attributes: {
                        first: 'lil',
                        last: 'wayne',
                        email: 'lwayne@example.com'
                    }
                }
            })
            .expect(201)
            .expect(function(res) {
                expect(res.body).to.have.property('data').that.is.an('object');
                expect(res.body.data).to.have.property('attributes').that.is.an('object');
                expect(res.body.data.attributes).to.have.all.keys('_id', '__v', 'first', 'last', 'email', 'createdAt', 'status');
            })
            .end(done);
    });

    it('should allow the server to process the data', function(done) {
        request.post('/api/users')
            .set(defaultHeaders)
            .send({
                data: {
                    type: 'user',
                    attributes: {
                        first: 'lil',
                        last: 'wayne',
                        email: 'lwayne@example.com',
                        status: 'active',
                        random: 'stuff'
                    }
                }
            })
            .expect(201)
            .expect(function(res) {
                expect(res.body).to.have.property('data').that.is.an('object');
                expect(res.body.data).to.have.property('attributes').that.is.an('object');
                expect(res.body.data.attributes).to.have.all.keys('_id', '__v', 'first', 'last', 'email', 'createdAt', 'status');
                expect(res.body.data.attributes.status).to.equal('unverified');
            })
            .end(done);
    });
});
