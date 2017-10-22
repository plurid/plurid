'use strict';

var assert = require('chai').assert;

const index = require('../index');

describe('Mocha Work Test', function () {
    it('expects works', function () {
    	assert.equal(index.workTest(), "Works.");
    });
});