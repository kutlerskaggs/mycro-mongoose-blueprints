'use strict';

var async = require('async'),
    expect = require('chai').expect,
    faker = require('faker'),
    qs = require('qs'),
    sinon = require('sinon'),
    _ = require('lodash');

describe('find', function() {
    let defaultHeaders = { 'accept-version': '^1.0.0' };
    let kanye, tim;

    before(function(done) {
        async.parallel({
            kanye: function findKanye(fn) {
                mycro.models.user.findOne({first: 'kanye', last: 'west'}, function(err, user) {
                    kanye = user;
                    fn(err);
                });
            },
            tim: function findTim(fn) {
                mycro.models.user.findOne({first: 'tim', last: 'tebow'}, function(err, user) {
                    tim = user;
                    fn(err);
                });
            }
        }, done);
    });

    context('fields', function() {
        it('should allow the server to disable field selection');
        it('should allow the server to whitelist fields for selection/exclusion');
        it('should allow the server to blacklist fields for selection/exclusion');
        it('should enforce a whitelist over a blacklist');
        it('should should aggregate all field selections (server/client) and make the appropriate selections (whitelist over blacklist, server over client)');
        it('should allow for related resource field selection in the same manner as the primary resource');
    });

    context('page', function() {
        it('should allow the server to explicitly control pagination');
        it('should allow the server to set allowed pagination settings');
        it('should allow the server to explicitly control pagination of related resources');
        it('should allow the server to set allowed pagination settings of related resources');
    });


    context('filter', function() {
        it('should correctly parse query filter param', function(done) {
            async.parallel([
                function(fn) {
                    request.get('/api/users?' + qs.stringify({
                        filter: {
                            status: 'active'
                        }
                    })).set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                    .expect(200)
                    .expect(function(res) {
                        let statuses = _(res.body.data).map('attributes.status').uniq().value();
                        expect(statuses).to.eql(['active']);
                    })
                    .end(fn);
                },

                function(fn) {
                    request.get('/api/users?' + qs.stringify({
                        filter: {
                            status: ['active', 'inactive']
                        }
                    })).set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                    .expect(200)
                    .expect(function(res) {
                        let statuses = _(res.body.data).map('attributes.status').uniq().value();
                        expect(statuses).to.not.contain('unverified').and.not.contain('pending');
                    })
                    .end(fn);
                },

                
            ], done);
        });

        it('should allow the server to disable filters');
        it('should allow the server to whitelist fields for filtering');
        it('should allow the server to blacklist fields for filtering');
        it('should allow the server to set filters');
        it('should allow the server to process the query before it\'s executed');
    });

    context('include', function() {
        it('should allow the server to disable popluation');
        it('should allow the server to enforce population');
        it('should allow the server to whitelist relationships for population');
        it('should allow the server to blacklist relationships for population');
        it('should allow for deep population');
    });
});
