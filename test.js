'use strict';

var mongoose = require('mongoose'),
    _ = require('lodash');

let blogSchema = new mongoose.Schema({
    title:  String,
    author: String,
    body:   String,
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'comment'}],
    date: { type: Date, default: Date.now },
    hidden: Boolean,
    meta: {
        votes: Number,
        favs:  Number
    }
});

let Blog = mongoose.model('Blog', blogSchema);

console.log(Blog.schema.tree);
