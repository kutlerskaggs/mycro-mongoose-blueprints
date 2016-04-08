/* jshint expr:true */
'use strict';

var async = require('async'),
expect = require('chai').expect,
faker = require('faker'),
moment = require('moment'),
qs = require('qs'),
sinon = require('sinon'),
_ = require('lodash');

describe('detail', function() {
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

    it('should work', function(done) {
        async.auto({
            post: function findPost(fn) {
                mycro.models.post.findOne({}, fn);
            },

            test: ['post', function execTest(fn, r) {
                let url = '/api/posts/' + r.post.id;
                request.get(url)
                    .set(defaultHeaders)
                    .expect(200)
                    .expect(function(res) {
                        expect(res.body).to.have.property('data').that.is.an('object');
                    })
                    .end(fn);
            }]
        }, done);
    });

    it('should allow the server to apply filters', function(done) {
        async.auto({
            tim: function findTim(fn) {
                mycro.models.user.findOne({
                    email: 'ttebow@example.com'
                }, fn);
            },

            post: ['tim', function findPost(fn, r) {
                mycro.models.post.create({
                    author: r.tim.id,
                    status: 'draft',
                    body: 'Blah blah blah'
                }, fn);
            }],

            test: ['post', function execTest(fn, r) {
                let url = '/api/posts/' + r.post.id + '/query-policy';
                request.get(url)
                    .set(defaultHeaders)
                    .expect(404)
                    .expect(function(res) {
                        expect(res.body).to.not.have.property('data');
                    })
                    .end(fn);
            }],

            cleanup: ['test', function removePost(fn, r) {
                mycro.models.post.remove({_id: r.post.id}, fn);
            }]
        }, done);
    });
});
