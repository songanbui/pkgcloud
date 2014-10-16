/*
 * images.js: Implementation of Cloudstack Networks Client.
 *
 * (C) 2014, Song An BUI
 *
 */
var pkgcloud = require('../../../../../lib/pkgcloud'),
    network  = pkgcloud.providers.cloudstack.network;

/**
 * client.getNetwork
 *
 * @description get an array of images for the current account
 *
 * @param {object|Function}   [options]                     A set of options for the getNetwork call
 * @param {function}          callback                      f(err, networks) where networks is an array of Network
 * @returns {*}
 */
exports.getNetworks = function(options, callback) {
    var self = this;
    if (typeof options === 'function') {
        callback = options;
        options = { };
    } else {
        options = options || {};
    }
    return this._request({
        cmd: 'listNetworks',
        params: options
    }, function (err, body) {
        if (err) {
            return callback(err);
        }
        if (!body || !body.network) {
            return callback(new Error('Unexpected empty response'));
        }
        else {
            return callback(null, body['network'].map(function (result) {
                return new network.Network(self, result);
            }));
        }
    });
};