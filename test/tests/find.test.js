'use strict';

var async = require('async'),
    expect = require('chai').expect,
    faker = require('faker'),
    qs = require('qs'),
    sinon = require('sinon'),
    _ = require('lodash');

describe('find', function() {
    let defaultHeaders = { 'accept-version': '^1.0.0' };

    context('fields', function() {
        it('should allow the server to disable field selection for primary and related resources');
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
        let kanye, tim;

        before(function(done) {
            async.parallel({
                kanye: function findKanye(fn) {
                    mycro.models.users.findOne({first: 'kanye', last: 'west'}, function(err, user) {
                        kanye = user;
                        fn(err);
                    });
                },
                tim: function findTim(fn) {
                    mycro.models.users.findOne({first: 'tim', last: 'tebow'}, function(err, user) {
                        tim = user;
                        fn(err);
                    });
                }
            }, done);
        });


        it('should allow the server to disable filters', function(done) {
            async.parallel([
                function noFilters(fn) {
                    request.get('/api/posts/disable-filter')
                        .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                        .expect(200)
                        .expect(function(res) {
                            expect(res.body.data).to.be.an('array').with.lengthOf(3);
                            expect(_(res.body.data).map('relationships.author.data.id').uniq().value()).to.eql([kanye.id]);
                        })
                        .end(fn);
                },

                function withFilters(fn) {
                    request.get('/api/posts/disable-filter?' + qs.stringify({
                            filter: {
                                status: 'published'
                            }
                        }))
                        .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                        .expect(200)
                        .expect(function(res) {
                            expect(res.body.data).to.be.an('array').with.lengthOf(3);
                            expect(_(res.body.data).map('relationships.author.data.id').uniq().value()).to.eql([kanye.id]);
                        })
                        .end(fn);
                },

                function withFilters2(fn) {
                    request.get('/api/posts/disable-filter?' + qs.stringify({
                            filter: {
                                status: 'archived'
                            }
                        }))
                        .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                        .expect(200)
                        .expect(function(res) {
                            expect(res.body.data).to.be.an('array').with.lengthOf(3);
                            expect(_(res.body.data).map('relationships.author.data.id').uniq().value()).to.eql([kanye.id]);
                        })
                        .end(fn);
                }
            ], done);
        });


        it('should allow the server to whitelist fields for filtering', function(done) {
            async.parallel([
                function withWhitelistedFilters(fn) {
                    async.auto({
                        count: function findCount(_fn) {
                            mycro.models.users.count({
                                department: 'accounting',
                                status: 'active'
                            }, _fn);
                        },
                        test: ['count', function execTest(_fn, r) {
                            request.get('/api/users/whitelist?' + qs.stringify({
                                    filter: {
                                        department: 'accounting',
                                        status: 'active'
                                    }
                                }))
                                .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                                .expect(200)
                                .expect(function(res) {
                                    expect(res.body.data).to.be.an('array').with.lengthOf(r.count);
                                })
                                .end(_fn);
                        }]
                    }, fn);
                },

                function withSomeWhitelistedFilters(fn) {
                    async.auto({
                        count: function findCount(_fn) {
                            mycro.models.users.count({
                                department: 'accounting'
                            }, _fn);
                        },
                        test: ['count', function execTest(_fn, r) {
                            request.get('/api/users/whitelist?' + qs.stringify({
                                    filter: {
                                        department: 'accounting',
                                        first: 'jeff'
                                    }
                                }))
                                .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                                .expect(200)
                                .expect(function(res) {
                                    expect(res.body.data).to.be.an('array').with.lengthOf(r.count);
                                })
                                .end(_fn);
                        }]
                    }, fn);
                },

                function withNonWhitelistedFilters(fn) {
                    async.auto({
                        count: function findCount(_fn) {
                            mycro.models.users.count({}, _fn);
                        },
                        test: ['count', function execTest(_fn, r) {
                            request.get('/api/users/whitelist?' + qs.stringify({
                                    filter: {
                                        first: 'jeff'
                                    }
                                }))
                                .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                                .expect(200)
                                .expect(function(res) {
                                    expect(res.body.data).to.be.an('array').with.lengthOf(r.count);
                                })
                                .end(_fn);
                        }]
                    }, fn);
                }
            ], done);
        });


        it('should allow the server to blacklist fields for filtering', function(done) {
            async.parallel([
                function withAllBlacklistedFilters(fn) {
                    async.auto({
                        count: function findCount(_fn) {
                            mycro.models.users.count({}, _fn);
                        },

                        test: ['count', function execTest(_fn, r) {
                            request.get('/api/users/whitelist?' + qs.stringify({
                                    filter: {
                                        department: 'accounting'
                                    }
                                }))
                                .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                                .expect(200)
                                .expect(function(res) {
                                    expect(res.body.data).to.be.an('array').with.lengthOf(r.count);
                                })
                                .end(_fn);
                        }]
                    }, fn);
                },

                function withSomeBlacklistedFilters(fn) {
                    async.auto({
                        count: function findCount(_fn) {
                            mycro.models.users.count({
                                first: 'jeff'
                            }, _fn);
                        },

                        test: ['count', function execTest(_fn, r) {
                            request.get('/api/users/whitelist?' + qs.stringify({
                                    filter: {
                                        first: 'jeff',
                                        department: 'random'
                                    }
                                }))
                                .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                                .expect(200)
                                .expect(function(res) {
                                    expect(res.body.data).to.be.an('array').with.lengthOf(r.count);
                                })
                                .end(_fn);
                        }]
                    }, fn);
                },

                function withNoBlacklistedFilters(fn) {
                    async.auto({
                        count: function findCount(_fn) {
                            mycro.models.users.count({
                                status: 'active'
                            }, _fn);
                        },

                        test: ['count', function execTest(_fn, r) {
                            request.get('/api/users/whitelist?' + qs.stringify({
                                    filter: {
                                        status: 'active'
                                    }
                                }))
                                .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                                .expect(200)
                                .expect(function(res) {
                                    expect(res.body.data).to.be.an('array').with.lengthOf(r.count);
                                })
                                .end(_fn);
                        }]
                    }, fn);
                }
            ], done);
        });


        it('should allow the server to set filters', function(done) {
            async.parallel([
                function noUserFilter(fn) {
                    request.get('/api/posts/server-filter')
                        .set(_.merge({'x-user-id': kanye._id}, defaultHeaders))
                        .expect(200)
                        .expect(function(res) {
                            expect(_(res.body.data).map('relationships.author.data.id').uniq().value()).to.eql([kanye._id.toString()]);
                        })
                        .end(fn);
                },

                function userFilterOnSameAttribute(fn) {
                    request.get('/api/posts/server-filter?' + qs.stringify({
                            filter: {
                                author: tim.id
                            }
                        }))
                        .set(_.merge({'x-user-id': kanye._id}, defaultHeaders))
                        .expect(200)
                        .expect(function(res) {
                            expect(res.body.data).to.be.an('array').with.lengthOf(0);
                        })
                        .end(fn);
                },

                function userFilterOnDifferentAttribute(fn) {
                    async.auto({
                        published: function countPublished(_fn) {
                            mycro.models.posts.count({author: kanye.id, status: 'published'}, _fn);
                        },

                        requestPublishedPosts: ['published', function requestPosts(_fn, r) {
                            request.get('/api/posts/server-filter?' + qs.stringify({
                                    filter: {
                                        status: 'published'
                                    }
                                }))
                                .set(_.merge({'x-user-id': kanye._id}, defaultHeaders))
                                .expect(200)
                                .expect(function(res) {
                                    expect(res.body.data).to.be.an('array').with.lengthOf(r.published);
                                })
                                .end(_fn);
                        }]
                    }, fn);
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
