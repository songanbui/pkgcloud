/*
 * index.js: Top-level include for the Cloudstack compute module
 *
 * (C) 2014, Song An BUI
 *
 */

exports.Client = require('./client').Client;
exports.Flavor = require('./flavor').Flavor;
exports.Image  = require('./image').Image;
exports.Server = require('./server').Server;

exports.createClient = function (options) {
    return new exports.Client(options);
};