'use strict';

var assert = require('chai').assert;

const index = require('../app');

describe('Mocha Work Test', function () {
    it('expects works', function () {
    	assert.equal(index.workTest(), "Works.");
    });
});