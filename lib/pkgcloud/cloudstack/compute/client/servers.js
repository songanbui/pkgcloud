/*
 * servers.js: Implementation of Cloudstack Servers Client.
 *
 * (C) 2014, Song An BUI
 *
 */
var pkgcloud = require('../../../../../lib/pkgcloud'),
    base     = require('../../../core/compute'),
    async    = require('async'),
    util     = require('util'),
    _        = require('underscore'),
    Server   = require('../server').Server,
    Image    = require('../image').Image,
    compute  = pkgcloud.providers.cloudstack.compute;
    network  = pkgcloud.providers.cloudstack.network;

/**
 * client.getServers
 *
 * @description get an array of servers for the current account
 *
 * @param {object|Function}   [options]     A set of options for the getServers call
 * @param {function}          callback      f(err, servers) where servers is an array of Server
 * @returns {*}
 */
exports.getServers = function getServers(options, callback) {
    var self = this;
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    options = options || {};
    return self._request({
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
        serverId = server instanceof Server ? server.id : server;
    return self._request({
        cmd: 'listVirtualMachines',
        params: {
            id: serverId
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

/**
 * client.createServer
 *
 * @description Creates a server with the specified options. The flavor properties
 * of the options can be instances of Flavor OR ids to those entities in Cloudstack.

 * @param {object}          details                 the details to create this server
 * @param {String}          details.name            the name of the new server
 * @param {Object|String}   details.flavor          the flavor or flavorId for the new server
 * @param {Object|String}   details.image           the image or imageId for the new server
 * @param {Object}          [details.zoneid]        optional zone id || default: zone corresponding to image
 * @param {Array|String}    [details.networkids]    optional array of network ids or string of one network id || default: first public network corresponding to zoneid
 * @param callback
 * @returns {request|*}
 */
exports.createServer = function createServer(details, callback) {
    if (typeof details === 'function') {
        callback = details;
        details = {};
    }
    details = details || {};
    var self = this,
        params = {};
    if (!self._validateProperties(['flavor', 'image', 'name'], details,
        '%s is a required argument.', callback)) {
        return;
    }
    if (details.name) {
        params.name = details.name;
        params.displayname = details.name;
    }
    if (details.flavor) {
        params.serviceofferingid = details.flavor instanceof base.Flavor
            ? details.flavor.id
            : details.flavor;
    }
    if (details.image) {
        params.templateid = details.image  instanceof Image
            ? details.image.id
            : details.image;
    }
    async.waterfall([
        function(zoneCallback){
            if (details.zoneid) {
                zoneCallback(null,details.zoneid);
            }
            else {
                if (details.image instanceof Image){
                    zoneCallback(null,details.image.zoneid);
                }
                else {
                    self.getImage(details.image, function(err,image){
                        if (err) { zoneCallback(err); }
                        else {
                            zoneCallback(null,image.zoneid);
                        }
                    })
                }
            }
        },
        function (zoneid, networkCallback){
            if(details.networkids){
                networkCallback(null, [ zoneid, details.networkids ]);
            }
            else{
                network
                    .createClient({
                        "provider": self.provider,
                        "apiUri": self.apiUri,
                        "apiKey": self.apiKey,
                        "apiSecret": self.apiSecret,
                        "projectId": self.projectId
                    })
                    .getNetworks({
                        zoneid: zoneid
                    },function(err,networks){
                        if(err){ networkCallback(err); }
                        else {
                            networkCallback(null, [ zoneid, networks[0].id ]);
                        }
                    });
            }
        }
    ],function(err, result){
        if(err) { return callback(err) ; }
        else {
            params.zoneid = result[0];
            params.networkids = result[1];
            return self._request({
                cmd: 'deployVirtualMachine',
                params: params
            }, function (err, response) {
                if(err) { return callback(err); }
                else {
                    return callback(null, new compute.Server(self, params), response);
                }
            });
        }
    });
};

/**
 * client.destroyServer
 *
 * @description Delete a server
 *
 * @param {String|object}   server    The server or serverId to delete
 * @param {Function}        callback
 * @returns {request|*}
 */
exports.destroyServer = function destroyServer(server, callback) {
    var serverId = server instanceof base.Server ? server.id : server;
    return this._request({
        cmd: 'destroyVirtualMachine',
        params: {
            id: serverId
        }
    }, function (err, response) {
        if(err) { return callback(err); }
        else {
            return callback(null, response);
        }
    });
};

/**
 * client.rebootServer
 *
 * @description Reboot the provider server
 *
 * @param {String|object}   server      The server or serverId to reboot
 * @param {Function}        callback
 * @returns {*}
 */
exports.rebootServer = function rebootServer(server, callback) {
    var serverId = server instanceof base.Server ? server.id : server;
    return this._request({
        cmd: 'rebootVirtualMachine',
        params: {
            id: serverId
        }
    }, function (err, response) {
        if(err) { return callback(err); }
        else {
            return callback(null, response);
        }
    });
};

/**
 * client.startServer
 *
 * @description Start the provider server
 *
 * @param {String|object}   server      The server or serverId to start
 * @param {Function}        callback
 * @returns {*}
 */
exports.startServer = function startServer(server, callback) {
    var serverId = server instanceof base.Server ? server.id : server;
    return this._request({
        cmd: 'startVirtualMachine',
        params: {
            id: serverId
        }
    }, function (err, response) {
        if(err) { return callback(err); }
        else {
            return callback(null, response);
        }
    });
};

/**
 * client.stopServer
 *
 * @description Stop the provider server
 *
 * @param {String|object}   server      The server or serverId to stop
 * @param {Function}        callback
 * @returns {*}
 */
exports.stopServer = function stopServer(server, callback) {
    var serverId = server instanceof base.Server ? server.id : server;
    return this._request({
        cmd: 'stopVirtualMachine',
        params: {
            id: serverId
        }
    }, function (err, response) {
        if(err) { return callback(err); }
        else {
            return callback(null, response);
        }
    });
};