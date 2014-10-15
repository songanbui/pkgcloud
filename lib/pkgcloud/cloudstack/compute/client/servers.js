/*
 * servers.js: Implementation of Cloudstack Servers Client.
 *
 * (C) 2014, Song An BUI
 *
 */
var pkgcloud = require('../../../../../lib/pkgcloud'),
    base     = require('../../../core/compute'),
    urlJoin  = require('url-join'),
    compute  = pkgcloud.providers.cloudstack.compute;

var _urlPrefix = 'servers';

/**
 * client.getServers
 *
 * @description get an array of servers for the current account
 *
 * @param {object|Function}   [options]     A set of options for the getServers call
 * @param {function}          callback      f(err, servers) where servers is an array of Server
 * @returns {*}
 */
exports.getServers = function(options, callback) {
    var self = this;
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    return this._request({
        cmd: 'listVirtualMachines',
        params: options
    }, function (err, body) {
        if (err) {
            return callback(err);
        }
        if (!body || !body['virtualmachine']) {
            return callback(new Error('Unexpected empty response'));
        }
        else {
            return callback(null, body['virtualmachine'].map(function (result) {
                return new compute.Server(self, result);
            }));
        }
    });
};

/**
 * client.getServer
 *
 * @description Gets a server from the account
 *
 * @param {String|object}   server    The server or serverId to fetch
 * @param {Function}        callback
 * @returns {request|*}
 */
exports.getServer = function getServer(server, callback) {
    var self = this,
        serverId = server instanceof base.Server ? server.id : server;

    return this._request({
        cmd: 'listVirtualMachines',
        params: {
            id:serverId
        }
    }, function (err, body) {
        if (err) {
            return callback(err);
        }
        if (!body || !body['virtualmachine']) {
            return callback(new Error('Unexpected empty response'));
        }
        else {
            var server = body['virtualmachine'].filter(function (server) {
                return server.id == serverId;
            })[0];

            return !server
                ? callback(new Error('No server found with id: ' + serverId))
                : callback(null, new compute.Server(self, server));
        }
    });
};