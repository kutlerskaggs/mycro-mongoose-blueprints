'use strict';

var async = require('async'),
    chai = require('chai'),
    faker = require('faker'),
    moment = require('moment'),
    sinonchai = require('sinon-chai'),
    supertest = require('supertest'),
    users = require('../fixtures/users'),
    _ = require('lodash');

let expect = chai.expect;

describe('basic test', function() {
    let cwd = process.cwd();

    before(function(done) {
        async.auto({
            mycro: function(fn) {
                process.chdir(__dirname + '/../dummy');
                global.mycro = require('../dummy/app');
                mycro.start(function(err) {
                    if (err) {
                        return fn(err);
                    }
                    global.request = supertest.agent(mycro.server);
                    fn();
                });
            },

            clear: ['mycro', function(fn) {
                async.each(['user', 'post', 'comment'], function(model, _fn) {
                    mycro.models[model].remove({}, _fn);
                }, fn);
            }],

            users: ['clear', function(fn) {
                mycro.models.user.create(users, fn);
            }],

            posts: ['users', function(fn, r) {
                let statuses = ['published', 'draft', 'archived'];
                async.each(r.users, function(user, _fn) {
                    let posts = _.range(3).map(function() {
                        return {
                            author: user._id,
                            body: faker.lorem.paragraph(),
                            status: faker.random.arrayElement(statuses),
                            likes: _.range(_.random(1,3)).map(function() {
                                return faker.random.arrayElement(r.users)._id;
                            }),
                            createdAt: faker.date.between(moment('01/01/2015').toDate(), moment().toDate()),
                            nested: {
                                user: faker.random.arrayElement(r.users)._id
                            }
                        };
                    });
                    mycro.models.post.create(posts, _fn);
                }, fn);
            }],

            comments: ['posts', function(fn, r) {
                async.waterfall([
                    function(_fn) {
                        mycro.models.post.find({}, _fn);
                    },

                    function(posts, _fn) {
                        // each post should have three comments
                        async.each(posts, function(post, __fn) {
                            let comments = _.range(3).map(function() {
                                return {
                                    author: faker.random.arrayElement(r.users)._id,
                                    body: faker.lorem.sentence()
                                };
                            });
                            async.waterfall([
                                function createComments(___fn) {
                                    mycro.models.comment.create(comments, ___fn);
                                },

                                function addtoPost(created, ___fn) {
                                    post.comments = _.map(created, '_id');
                                    post.save(___fn);
                                }
                            ], __fn);
                        }, _fn);
                    }
                ], fn);
            }]
        }, done);
    });

    it('should start successfully', function(done) {
        request.get('/health')
            .set('accept-version', '^1.0.0')
            .expect(200)
            .end(done);
    });
});
