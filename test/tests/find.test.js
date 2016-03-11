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
        it('should select the appropriate fields', function(done) {
            async.parallel([
                function(fn) {
                    request.get('/api/users?' + qs.stringify({
                        fields: {
                            user: 'first,last'
                        }
                    }))
                    .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                    .expect(200)
                    .expect(function(res) {
                        res.body.data.forEach(function(user) {
                            expect(user.attributes).to.have.all.keys('first', 'last', '_id');
                        });
                    })
                    .end(fn);
                },

                function(fn) {
                    request.get('/api/posts?' + qs.stringify({
                        fields: {
                            post: 'body'
                        }
                    }))
                    .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                    .expect(200)
                    .expect(function(res) {
                        res.body.data.forEach(function(user) {
                            expect(user.attributes).to.have.all.keys('body', '_id');
                        });
                    })
                    .end(fn);
                }
            ], done);
        });

        it('should allow the server to whitelist fields for selection/exclusion', function(done) {
            async.series([
                function inclusive(fn) {
                    mycro.services.mongoose._testHook = function(results) {
                        expect(results.fields.user.include).to.eql(['first', 'last']);
                    };
                    request.get('/api/users/fields-whitelist?' + qs.stringify({
                        fields: {
                            user: 'first,last,password'
                        }
                    }))
                    .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                    .expect(200)
                    .expect(function(res) {
                        delete mycro.services.mongoose._testHook;
                        res.body.data.forEach(function(user) {
                            expect(user.attributes).to.have.all.keys('first', 'last', '_id');
                        });
                    })
                    .end(function(err, res) {
                        fn(err);
                    });
                },

                function none(fn) {
                    mycro.services.mongoose._testHook = function(results) {
                        ['createdAt', 'body', 'status'].forEach(function(attr) {
                            expect(results.fields.post.include).to.contain(attr);
                        });
                    };
                    request.get('/api/posts/fields-whitelist')
                    .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                    .expect(200)
                    .expect(function(res) {
                        delete mycro.services.mongoose._testHook;
                        res.body.data.forEach(function(user) {
                            expect(user.attributes).to.have.all.keys('createdAt', 'body', 'status', '_id');
                        });
                    })
                    .end(fn);
                },

                function exclusive(fn) {
                    request.get('/api/posts/fields-whitelist?' + qs.stringify({
                        fields: {
                            post: '-body,-createdAt,-status'
                        }
                    }))
                    .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                    .expect(200)
                    .expect(function(res) {
                        res.body.data.forEach(function(user) {
                            expect(user.attributes).to.have.all.keys('_id');
                        });
                    })
                    .end(fn);
                },

                function inclusiveAndExclusive(fn) {
                    request.get('/api/posts/fields-whitelist?' + qs.stringify({
                        fields: {
                            post: 'body,-createdAt,-status'
                        }
                    }))
                    .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                    .expect(200)
                    .expect(function(res) {
                        res.body.data.forEach(function(user) {
                            expect(user.attributes).to.have.all.keys('_id', 'body');
                        });
                    })
                    .end(fn);
                }
            ], done);
        });

        it('should allow the server to blacklist fields for selection/exclusion', function(done) {
            async.parallel([
                function inclusive(fn) {
                    request.get('/api/posts/fields-blacklist?' + qs.stringify({
                        fields: {
                            post: 'body,createdAt,status'
                        }
                    }))
                    .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                    .expect(200)
                    .expect(function(res) {
                        res.body.data.forEach(function(post) {
                            expect(post.attributes).to.have.all.keys('_id', 'body', 'status');
                        });
                    })
                    .end(fn);
                },

                function none(fn) {
                    request.get('/api/posts/fields-blacklist')
                    .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                    .expect(200)
                    .expect(function(res) {
                        res.body.data.forEach(function(post) {
                            let attrs = Object.keys(post.attributes);
                            expect(attrs).to.have.length.above(1);
                            expect(post.attributes).to.not.have.property('createdAt');
                        });
                    })
                    .end(fn);
                },

                function exclusive(fn) {
                    request.get('/api/posts/fields-blacklist?' + qs.stringify({
                        fields: {
                            post: '-status'
                        }
                    }))
                    .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                    .expect(200)
                    .expect(function(res) {
                        res.body.data.forEach(function(post) {
                            expect(post.attributes).to.not.have.property('createdAt');
                            expect(post.attributes).to.not.have.property('status');
                        });
                    })
                    .end(fn);
                },

                function inclusiveAndExclusive(fn) {
                    request.get('/api/posts/fields-blacklist?' + qs.stringify({
                        fields: {
                            post: 'body,-status'
                        }
                    }))
                    .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                    .expect(200)
                    .expect(function(res) {
                        res.body.data.forEach(function(post) {
                            expect(post.attributes).to.have.all.keys('body', '_id');
                        });
                    })
                    .end(fn);
                }
            ], done);
        });

        it('should allow for related resource field selection in the same manner as the primary resource');
    });

    context('page', function() {
        it('should allow the server to explicitly control pagination');

        it('should allow the server to set allowed pagination settings', function(done) {
            async.parallel([
                function(fn) {
                    request.get('/api/users?' + qs.stringify({
                        page: {
                            size: 1000
                        }
                    }))
                    .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                    .expect(400)
                    .end(fn);
                },

                function(fn) {
                    request.get('/api/posts?' + qs.stringify({
                        page: {
                            size: 101
                        }
                    }))
                    .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                    .expect(400)
                    .end(fn);
                },

                function(fn) {
                    request.get('/api/posts/pagination?' + qs.stringify({
                        page: {
                            size: 20
                        }
                    }))
                    .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                    .expect(400)
                    .end(fn);
                },

                function(fn) {
                    request.get('/api/posts/pagination?' + qs.stringify({
                        page: {
                            size: 4
                        }
                    }))
                    .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                    .expect(400)
                    .end(fn);
                },

                function(fn) {
                    request.get('/api/posts/pagination')
                    .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                    .expect(200)
                    .expect(function(res) {
                        expect(res.body.data).to.have.lengthOf(10);
                    })
                    .end(fn);
                }
            ], done);
        });

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
                    }))
                    .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
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

        it('should allow the server to whitelist fields for filtering', function(done) {
            async.series([
                function(fn) {
                    mycro.services.mongoose._testHook = function(results) {
                        expect(results.filter).to.be.an('object');
                        expect(results.filter).to.have.all.keys('department');
                        expect(results.filter.department).to.have.property('$eq', 'sales');
                    };

                    request.get('/api/users/query-whitelist?' + qs.stringify({
                        filter: {
                            first: 'kanye',
                            department: 'sales'
                        }
                    }))
                    .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                    .expect(200)
                    .end(function(err) {
                        delete mycro.services.mongoose._testHook;
                        fn(err);
                    });
                }
            ], done);
        });

        it('should allow the server to blacklist fields for filtering', function(done) {
            async.series([
                function(fn) {
                    mycro.services.mongoose._testHook = function(results) {
                        expect(results.filter).to.be.an('object');
                        expect(results.filter).to.have.all.keys('first');
                        expect(results.filter.first).to.have.property('$eq', 'kanye');
                    };

                    request.get('/api/users/query-blacklist?' + qs.stringify({
                        filter: {
                            department: 'accounting',
                            first: 'kanye',
                            'phone.house': 'test'
                        }
                    }))
                    .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                    .expect(200)
                    .expect(function(res) {
                        let departments = _(res.body.data).map('attributes.department').uniq().value();
                        expect(departments).to.contain('sales');
                    })
                    .end(function(err) {
                        delete mycro.services.mongoose._testHook;
                        fn(err);
                    });
                },

                function(fn) {
                    mycro.services.mongoose._testHook = function(results) {
                        expect(results.filter).to.be.an('object');
                        expect(results.filter).to.not.have.property('nested.user');
                    };

                    request.get('/api/posts/query-blacklist?' + qs.stringify({
                        filter: {
                            'nested.user': kanye.id
                        }
                    }))
                    .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
                    .expect(200)
                    .end(function(err) {
                        delete mycro.services.mongoose._testHook;
                        fn(err);
                    });
                }
            ], done);
        });

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

        it('should allow the server to process the query before it\'s executed', function(done) {
            let test = {
                process: function(results, cb) {
                    _.extend(results.filter, {
                        first: {
                            $eq: 'tim'
                        },
                        last: {
                            $eq: 'tebow'
                        }
                    });
                    async.setImmediate(cb);
                }
            };
            sinon.spy(test, 'process');
            mycro.services.mongoose._processQuery = test.process;
            request.get('/api/users?' + qs.stringify({
                filter: {
                    first: 'kanye'
                }
            }))
            .set(_.merge({'x-user-id': kanye.id}, defaultHeaders))
            .expect(200)
            .expect(function(res) {
                expect(res.body.data).to.be.an('array').with.lengthOf(1);
                expect(res.body.data[0].attributes).to.have.property('first', 'tim');
                expect(res.body.data[0].attributes).to.have.property('last', 'tebow');
            })
            .end(function(err) {
                delete mycro.services.mongoose._processQuery;
                done(err);
            });
        });
    });

    context('include', function() {
        it('should allow the server to disable popluation');
        it('should allow the server to enforce population');
        it('should allow the server to whitelist relationships for population');
        it('should allow the server to blacklist relationships for population');
        it('should allow for deep population');
    });
});
