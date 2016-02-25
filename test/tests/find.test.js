'use strict';

var async = require('async'),
    chai = require('chai'),
    faker = require('faker'),
    qs = require('qs'),
    sinon = require('sinon'),
    _ = require('lodash');

describe('find', function() {

    before(function(done) {
        async.auto({
            groups: function(fn) {
                let groups = [{
                    name: 'admins'
                }, {
                    name: 'users'
                }];
                mycro.models.groups.create(groups, fn);
            },

            users: ['groups', function(fn, r) {
                let adminsGroup = _.find(r.groups, function(group) {
                    return group.get('name') === 'admins';
                });
                let usersGroup = _.find(r.groups, function(group) {
                    return group.get('name') === 'users';
                });

                let users = [{
                    first: 'tim',
                    last: 'tebow',
                    department: 'fpa',
                    groups: [adminsGroup._id, usersGroup._id]
                }, {
                    first: 'kanye',
                    last: 'west',
                    department: 'fpa',
                    groups: [usersGroup._id]
                }, {
                    first: 'kendrick',
                    last: 'lamar',
                    department: 'accounting',
                    groups: [adminsGroup._id, usersGroup._id]
                }];

                users.forEach(function(user) {
                    _.extend(user, {
                        email: faker.internet.email(),
                        password: faker.internet.password(),
                        phone: {
                            home: faker.phone.phoneNumber(),
                            cell: faker.phone.phoneNumber(),
                            office: faker.phone.phoneNumber()
                        }
                    });
                });
                mycro.models.users.create(users, fn);
            }],
        }, done);
    });

    after(function(done) {
        async.parallel({
            users: function(fn) {
                mycro.models.users.remove({}, fn);
            },

            groups: function(fn) {
                mycro.models.groups.remove({}, fn);
            }
        }, done);
    });

    context('users', function() {
        it('should not fail', function(done) {
            let query = {
                filter: {
                    department: {
                        $in: ['executive', 'procurement']
                    }
                }
            };
            request.get('/api/users?' + qs.stringify(query, {encode: false}))
                .set({ 'accept-version': '^1.0.0' })
                .expect(200)
                .end(function(err, res) {
                    console.log(res.body);
                    done(err);
                });
        });
    });
});
