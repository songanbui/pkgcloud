/*
 * flavors.js: Implementation of Cloudstack Flavors Client.
 *
 * (C) 2014, Song An BUI
 *
 */

var pkgcloud = require('../../../../../lib/pkgcloud'),
    base     = require('../../../core/compute'),
    compute  = pkgcloud.providers.cloudstack.compute;

var _urlPrefix = 'flavors';

/**
 * client.getFlavors
 *
 * @description get an array of flavors for the current account
 *
 * @param callback
 * @returns {*}
 */
exports.getFlavors = function(callback) {
    var self = this;
    return this._request({
        cmd: 'listServiceOfferings',
        params: {}
    }, function (err, body) {
        if (err) {
            return callback(err);
        }
        if (!body || !body.serviceoffering) {
            console.log(JSON.stringify(body));
            return callback(new Error('Unexpected empty response'));
        }
        else {
            return callback(null, body.serviceoffering.map(function (result) {
                return new compute.Flavor(self, result);
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
        if (!body || !body.serviceoffering) {
            console.log(JSON.stringify(body));
            return callback(new Error('Unexpected empty response'));
        }
        else {
            var flavor = body.serviceoffering.filter(function (flavor) {
                return flavor.id == flavorId;
            })[0];

            return !flavor
                ? callback(new Error('No flavor found with id: ' + flavorId))
                : callback(null, new compute.Flavor(self, flavor));
        }
    });
};