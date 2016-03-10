'use strict';

var async = require('async'),
    expect = require('chai').expect,
    faker = require('faker'),
    moment = require('moment'),
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
                function testEq(fn) {
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

                function testIn(fn) {
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

                function testRegex(fn) {
                    request.get('/api/users?' + qs.stringify({
                        filter: {
                            first: {
                                regex: '^kan\\w+$'
                            }
                        }
                    })).set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                    .expect(200)
                    .expect(function(res) {
                        expect(res.body.data).to.be.an('array').with.length.of.at.least(1);
                        let firstNames = _(res.body.data).map('attributes.first').value();
                        firstNames.forEach(function(name) {
                            expect(name).to.match(/^kan\w+$/g);
                        });
                    })
                    .end(fn);
                },

                function testDate(fn) {
                    request.get('/api/users?' + qs.stringify({
                        filter: {
                            createdAt: {
                                gte: moment('03/01/2015').toDate(),
                                lt: moment('04/01/2015').toDate()
                            }
                        }
                    })).set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                    .expect(200)
                    .expect(function(res) {
                        expect(res.body.data).to.be.an('array').with.length.of.at.least(1);
                        let dates = _(res.body.data).map('attributes.createdAt').value();
                        dates.forEach(function(date) {
                            expect(moment(date).isBetween('03/01/2015', '04/01/2015')).to.equal(true);
                        });
                    })
                    .end(fn);
                },

                function testNested(fn) {
                    request.get('/api/posts?' + qs.stringify({
                        filter: {
                            'nested.user': [kanye.id, tim.id]
                        }
                    })).set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                    .expect(200)
                    .expect(function(res) {
                        if (res.body.data.length) {
                            res.body.data.forEach(function(post) {
                                let nestedUser = post.relationships['nested.user'].data.id;
                                expect([kanye.id, tim.id]).to.contain(nestedUser);
                            });
                        }
                    })
                    .end(fn);
                }
            ], done);
        });

        it('should allow the server to disable filters');
        it('should allow the server to whitelist fields for filtering');
        it('should allow the server to blacklist fields for filtering');

        it('should allow the server to set filters', function(done) {
            async.parallel([
                function(fn) {
                    request.get('/api/posts/query-policy')
                        .set(defaultHeaders)
                        .expect(401)
                        .end(fn);
                },

                function(fn) {
                    request.get('/api/posts/query-policy')
                        .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                        .expect(200)
                        .expect(function(res) {
                            res.body.data.forEach(function(post) {
                                let published = post.attributes.status === 'published',
                                    own = post.relationships.author.data.id === kanye.id;
                                expect(published || own).to.equal(true);
                            });
                        })
                        .end(fn);
                },

                function(fn) {
                    request.get('/api/posts/query-policy?' + qs.stringify({
                            filter: {
                                author: {
                                    ne: kanye.id
                                },
                                status: {
                                    ne: 'published'
                                }
                            }
                        }))
                        .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                        .expect(200)
                        .expect(function(res) {
                            expect(res.body.data).to.be.an('array').with.lengthOf(0);
                        })
                        .end(fn);
                },

                function(fn) {
                    request.get('/api/users/query-policy?' + qs.stringify({
                            filter: {
                                department: 'accounting'
                            },
                            sort: '-createdAt'
                        }))
                        .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                        .expect(200)
                        .expect(function(res) {
                            let lastDate = new Date().toISOString();
                            res.body.data.forEach(function(user) {
                                expect(user.attributes.department).to.equal('accounting');
                                let createdAt = moment(user.attributes.createdAt);
                                expect(createdAt.isBefore(lastDate)).to.equal(true);
                                lastDate = createdAt.toDate().toISOString();
                                expect(user.attributes).to.not.have.property('phone');
                            });
                        })
                        .end(fn);
                }
            ], done);
        });

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
