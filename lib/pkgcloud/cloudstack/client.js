/*
 * client.js: Base client from which all Cloudstack clients inherit from
 * Inspired by node-cloudstack module by Chris 'Chatham' Hoffman : https://github.com/Chatham/node-cloudstack
 *
 * (C) 2014, Song An BUI
 *
 */

var util = require('util'),
    fs    = require('fs'),
    auth  = require('../common/auth'),
    base  = require('../core/base');
    request = require('request'),
    crypto = require('crypto');

var Client = exports.Client = function (opts) {
    if (!opts || !opts.apiUri || !opts.apiKey || !opts.apiSecret) {
        throw new TypeError('apiUri, apiKey and apiSecret are required');
    }

    base.Client.call(this, opts);

    this.provider = 'cloudstack';
    this.apiUri = opts.apiUri;
    this.apiKey = opts.apiKey;
    this.apiSecret = opts.apiSecret;
    this.projectId = opts.projectId;

    if (!this.before) {
        this.before = [];
    }
};

util.inherits(Client, base.Client);

Client.prototype.genSignedParamString = function(cmd, params) {
    var self = this,
        paramKeys = [],
        qsParameters = [],
        queryString;
    params.apiKey = self.apiKey;
    if (self.projectId) params.projectid = self.projectId;
    params.command = cmd;
    params.response = 'json';
    for(var key in params) {
        if(params.hasOwnProperty(key)){
            paramKeys.push(key);
        };
    };
    paramKeys.sort();
    for(var i = 0; i < paramKeys.length; i++) {
        key = paramKeys[i];
        qsParameters.push(key + '=' + encodeURIComponent(params[key]));
    }
    queryString =   qsParameters.join('&'),
                    cryptoAlg = crypto.createHmac('sha1', self.apiSecret),
                    signature = cryptoAlg.update(queryString.toLowerCase()).digest('base64');
    return queryString + '&signature=' + encodeURIComponent(signature);
};

/**
 * Client._request
 *
 * @description custom request implementation for Cloudstack
 *
 * @param {object}          options     options for this client request
 * @param {Function}        callback    the callback for the client request
 * @private
 */
Client.prototype._request = function (options, callback) {
    if (!options) {
        options = {};
    }
    var self = this,
        cmd = options.cmd,
        params = options.params,
        paramString,
        uri;

    paramString = self.genSignedParamString(
        cmd,
        params
    );
    uri = self.apiUri + '?' + paramString;
    request(uri, function (err, res, body) {
        if (err) {
            return callback(err);
        }
        var parsedBody = JSON.parse(body);
        if (res.statusCode == 200) {
            var result = parsedBody[cmd.toLowerCase() + 'response'];

            return callback(null, result);
        }
        // TODO: need all the error condition here
        callback(parsedBody);
    });
};