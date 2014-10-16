/*
 * index.js: Network client for Cloudstack
 *
 * (C) 2014, Song An BUI
 */

var util = require('util'),
    cloudstack = require('../../client'),
    _ = require('underscore');

var Client = exports.Client = function (options) {
    cloudstack.Client.call(this, options);

    _.extend(this, require('./networks'));

    this.serviceType = 'network';
};

util.inherits(Client, cloudstack.Client);