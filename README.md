# mycro-mongoose-blueprints
a [mycro](https://github.com/cludden/mycro) hook that provides [sails](https://github.com/balderdashy/sails)-like *blueprint* functionality for mycro apps.


*note: this is still in active development, use at your own risk*

## Install
install:
```bash
npm install --save mycro-mongoose-blueprints
```
add it to hooks:
```javascript
// in config/hooks.js
module.exports = [
    // ..
    'services',
    'mycro-mongoose-blueprints',
    // ..
];
```

## Getting Started
Via services:
```javascript
// in app/controllers/users.js
module.exports = {
    find(req, res) {
        let mycro = req.mycro;
        mycro.services.mongoose.find(req, {
            model: 'users'
        }, function(err, results) {
            if (err) {
                return res.json(500, {errors: [err]});
            }
            res.json(200, {data: results});
        });
    }
}
```

## API
### mycro.services.mongoose
#### find(req, [options], cb)
*find* blueprint query method

###### Arguments
| Param | Type | Description |
| :---: | :---: | :--- |
| `req` | `{Request}` | the request object |
| `[options]` | `{Object}` | options. these options will be merged with `req.options` |
| `[options.allowSelect]` | `{Boolean}` | whether to allow the requester to select the fields to return. defaults to `false` |
| `[options.model]` | `{String}` | the name of the model to use |
| `[options.include]` | `{Object}` | `include` options |
| `[options.pageSize]` | `{Number}` | the default page size. defaults to `10` |
| `[options.pageSizeMin]` | `{Number}` | the minimum page size allowed. defaults to `1` |
| `[options.pageSizeMax]` | `{Number}` | the maximum page size allowed. defaults to `100` |
