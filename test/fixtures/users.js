'use strict';

var faker = require('faker'),
    moment = require('moment'),
    _ = require('lodash');

let users = [{
    first: 'tim',
    last: 'tebow',
    email: 'ttebow@example.com',
    createdAt: moment('03/15/2015').toDate(),
    department: 'accounting',
    status: 'active'
},{
    first: 'kanye',
    last: 'west',
    email: 'kwest@example.com',
    department: 'sales',
    status: 'active'
},{
    first: 'jeff',
    last: 'bridges',
    email: 'jbridges@example.com',
    department: 'accounting',
    status: 'active'
},{
    first: 'jeff',
    status: 'active',
    department: 'marketing'
}];

let l = 30 - users.length;
for (var i = 0; i < l; i++) {
    users.push({});
}

let departments = [
    'accounting', 'sales', 'marketing'
];

let statuses = [
    'active', 'inactive', 'unverified', 'pending'
];

users.forEach(function(user) {
    let first = faker.name.firstName().toLowerCase(),
        last = faker.name.lastName().toLowerCase();
    _.defaults(user, {
        first: first,
        last: last,
        email: first.charAt(0) + last + '@example.com',
        createdAt: faker.date.between(moment('01/01/2015').toDate(), moment('12/31/2015').toDate()),
        department: faker.random.arrayElement(departments),
        password: faker.internet.password(),
        status: faker.random.arrayElement(statuses),
        phone: {
            home: faker.phone.phoneNumber(),
            cell: faker.phone.phoneNumber(),
            office: faker.phone.phoneNumber()
        }
    });
});

console.log(users.length);

module.exports = users;
