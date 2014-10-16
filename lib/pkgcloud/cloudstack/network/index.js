/*
 * index.js: Top-level include for the Cloudstack networking client.
 *
 * (C) 2014, Song An BUI
 *
 */

exports.Client  = require('./client').Client;
exports.Network = require('./network').Network;

exports.createClient = function (options) {
    return new exports.Client(options);
};
