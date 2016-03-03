'use strict';

module.exports = [
    'server',
    'connections',
    'models',
    'services',
    'mycro-error',
    'policies',
    'mycro-util-policies',
    'controllers',
    require('../../../index'),
    'routes',
    require('../hooks/bootstrap'),
    'start'
];
