'use strict';

module.exports = function tryCatch(fn, ctx, args) {
    try {
        return fn.apply(ctx, args);
    }
    catch(e) {
        return e;
    }
};
