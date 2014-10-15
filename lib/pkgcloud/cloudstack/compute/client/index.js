/*
 * index.js: Compute client for Cloudstack
 *
 * (C) 2014, Song An BUI
 */

var util = require('util'),
    cloudstack = require('../../client'),
    _ = require('underscore');

var Client = exports.Client = function (options) {
    cloudstack.Client.call(this, options);

    _.extend(this, require('./flavors'));
    //_.extend(this, require('./images'));
    //_.extend(this, require('./servers'));

    this.serviceType = 'compute';
};

util.inherits(Client, cloudstack.Client);