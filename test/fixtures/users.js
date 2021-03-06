'use strict';

var faker = require('faker'),
    _ = require('lodash');

let users = [{
    first: 'tim',
    last: 'tebow',
    email: 'ttebow@example.com',
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

let l = 10 - users.length;
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
    let first = faker.name.firstName(),
        last = faker.name.lastName();
    _.defaults(user, {
        first: first,
        last: last,
        email: first.charAt(0) + last + '@example.com',
        department: faker.random.arrayElement(departments),
        password: faker.internet.password(),
        phone: {
            home: faker.phone.phoneNumber(),
            cell: faker.phone.phoneNumber(),
            office: faker.phone.phoneNumber()
        }
    });
});

console.log(users.length);

module.exports = users;
