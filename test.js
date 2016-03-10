'use strict';

var mongoose = require('mongoose'),
    _ = require('lodash');

let blogSchema = new mongoose.Schema({
    title:  String,
    author: String,
    body:   String,
    comments: [{ body: String, date: Date }],
    date: { type: Date, default: Date.now },
    hidden: Boolean,
    meta: {
        votes: Number,
        favs:  Number
    }
});

let Blog = mongoose.model('Blog', blogSchema);

let query = Blog.find()
    .where('createdBy').in(['bschnelle@westmoreland.com', 'cludden@westmoreland.com'])
    .or([{createdBy: 'cludden@westmoreland.com'}]);

console.log(query);
