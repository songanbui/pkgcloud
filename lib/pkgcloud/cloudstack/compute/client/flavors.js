/*
 * flavors.js: Implementation of Cloudstack Flavors Client.
 *
 * (C) 2014, Song An BUI
 *
 */

var pkgcloud = require('../../../../../lib/pkgcloud'),
    base     = require('../../../core/compute'),
    compute  = pkgcloud.providers.cloudstack.compute;

/**
 * client.getFlavors
 *
 * @description get an array of flavors for the current account
 *
 * @param {object|Function}   [options]     A set of options for the getServers call
 * @param {function}          callback      f(err, flavors) where flavors is an array of Flavor
 * @returns {*}
 */
exports.getFlavors = function(options,callback) {
    var self = this;
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    return this._request({
        cmd: 'listServiceOfferings',
        params: options
    }, function (err, body) {
        if (err) {
            return callback(err);
        }
        if (!body || !body['serviceoffering']) {
            return callback(new Error('Unexpected empty response'));
        }
        else {
            return callback(null, body['serviceoffering'].map(function (flavors) {
                return new compute.Flavor(self, flavors);
            }));
        }
    });
};

/**
 * client.getFlavor
 *
 * @description get a flavor for the current account
 *
 * @param {String|object}     flavor     the flavor or flavorId to get
 * @param callback
 * @returns {*}
 */
exports.getFlavor = function(flavor, callback) {
    var self = this,
        flavorId = flavor instanceof base.Flavor ? flavor.id : flavor;
    return this._request({
        cmd: 'listServiceOfferings',
        params: {
            id:flavorId
        }
    }, function (err, body) {
        if (err) {
            return callback(err);
        }
        if (!body || !body['serviceoffering']) {
            return callback(new Error('Unexpected empty response'));
        }
        else {
            var flavor = body['serviceoffering'].filter(function (flavor) {
                return flavor.id == flavorId;
            })[0];
            return !flavor
                ? callback(new Error('No flavor found with id: ' + flavorId))
                : callback(null, new compute.Flavor(self, flavor));
        }
    });
};