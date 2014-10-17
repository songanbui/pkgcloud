/*
 * client.js: Base client from which all Cloudstack clients inherit from
 * Inspired by node-cloudstack module by Chris 'Chatham' Hoffman : https://github.com/Chatham/node-cloudstack
 *
 * (C) 2014, Song An BUI
 *
 */

var util     = require('util'),
    errs     = require('errs'),
    auth     = require('../common/auth'),
    base     = require('../core/base');
    request  = require('request'),
    crypto   = require('crypto');

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
    if (!this.before) { this.before = []; }
};

util.inherits(Client, base.Client);

/**
 * Client._genSignedParamString
 *
 * @description formats the Cloudstack base URL with provider parameters and generates a hashed signature
 *
 * @param {String}          cmd         Cloudstack API request name
 * @param {object}          params      parameters of the request
 * @private
 */
Client.prototype._genSignedParamString = function(cmd, params) {
    var self = this,
        paramKeys = [],
        qsParameters = [],
        queryString;
    params.apiKey = self.apiKey;
    if (self.projectId) { params.projectid = self.projectId; }
    params.command = cmd;
    params.response = 'json';
    for (var key in params) {
        if(params.hasOwnProperty(key)){
            paramKeys.push(key);
        };
    };
    paramKeys.sort();
    for (var i = 0; i < paramKeys.length; i++) {
        key = paramKeys[i];
        qsParameters.push(key + '=' + encodeURIComponent(params[key]));
    }
    queryString =   qsParameters.join('&'),
                    cryptoAlg = crypto.createHmac('sha1', self.apiSecret),
                    signature = cryptoAlg.update(queryString.toLowerCase()).digest('base64');
    //console.log(queryString);
    return queryString + '&signature=' + encodeURIComponent(signature);
};

/**
 * Client._request
 *
 * @description custom request implementation for Cloudstack
 *
 * @param {object}          options             options for this client request
 * @param {Function}        callback            the callback for the client request
 * @param {Function}        [progressCallback]  optional; the callback returning progress of the asynchronous client request
 * @private
 */
Client.prototype._request = function (options, callback, progressCallback) {
    if (!options) { options = {}; }
    var self = this,
        cmd = options.cmd,
        params = options.params,
        paramString = self._genSignedParamString(cmd, params),
        uri = self.apiUri + '?' + paramString;
    request(uri, function (err, res, body) {
        if (err) { return callback(err); }
        var parsedBody = JSON.parse(body);
        if (res.statusCode == 200) {
            var result = parsedBody[cmd.toLowerCase() + 'response'];
            if(progressCallback && result.jobid){
                self._asyncJobProgressCloudstack(err,result,callback,progressCallback);
            }
            else { return callback(null, result); }

        }
        else { return callback(parsedBody); }

    });
};

/**
 * validateProperties
 *
 * @description local helper function for validating arguments
 *
 * @param {Array}       required      The list of required properties
 * @param {object}      options       The options object to validate
 * @param {String}      formatString  String formatter for the error message
 * @param {Function}    callback
 * @returns {boolean}
 */
Client.prototype._validateProperties = function validateProperties(required, options, formatString, callback) {
    return !required.some(function (item) {
        if (typeof(options[item]) === 'undefined') {
            errs.handle(
                errs.create({ message: util.format(formatString, item) }),
                callback
            );
            return true;
        }
        return false;
    });
}

// Cloudstack specific and common APIs

/**
 * Client.listAsyncJobs
 *
 * @description lists all pending asynchronous jobs for the current account
 *
 * @param {object|Function}   [options]     A set of options for the listAsyncJobs call
 * @param {function}          callback      f(err, jobs)
 * @returns {*}
 */
Client.prototype.listAsyncJobs = function listAsyncJobs(options, callback){
    var self = this;
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    options = options || {};
    return self._request({
        cmd: 'listAsyncJobs',
        params: options
    }, function (err, body) {
        if (err) {
            return callback(err);
        }
        console.log(JSON.stringify(body));
        if (!body || !body['asyncjobs']) {
            return callback(new Error('Unexpected empty response'));
        }
        else {
            return callback(null, body['asyncjobs']);
        }
    });
};

/**
 * Client.listAsyncJobs
 *
 * @description gets an asynchronous job from the account
 *
 * @param {String|object}     jobId           The job id to fetch
 * @param {function}          callback      f(err, job)
 * @returns {*}
 */
Client.prototype.queryAsyncJobResult = function queryAsyncJobResult(jobId, callback){
    var self = this;
    return self._request({
        cmd: 'queryAsyncJobResult',
        params: {
            jobid: jobId
        }
    }, function (err, body) {
        if (err) {
            return callback(err);
        }
        if (!body) {
            return callback(new Error('Unexpected empty response'));
        }
        else {
            return callback(null, body);
        }
    });
};

/**
 * Client._asyncJobProgressCloudstack
 *
 * @description Cloudstack dedicated - local helper for handling asynchronous long job
 *
 * @private
 */
Client.prototype._asyncJobProgressCloudstack = function _asyncJobProgressCloudstack(error, result, callback, progressCallback) {
    var self = this;
    if (error) {
        callback(error);
    }
    else {
        var ready = 0;
        if (result && result.jobstatus) { ready = result['jobstatus']; }
        if (ready == 0) {
            if (progressCallback) { progressCallback(error, result); }
            setTimeout(function() {
                self.queryAsyncJobResult(result.jobid, function (error, result) {
                    self._asyncJobProgressCloudstack(error, result, callback, progressCallback);
                });
            }, 5000);
        }
        else if (ready == 1) {
            callback(error, result);
        }
    }
};
