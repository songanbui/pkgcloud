/*
 * network.js: Cloudstack "Network"
 *
 * (C) 2014 Song An BUI
 *
 */

var util  = require('util'),
    base  = require('../../core/network/network'),
    _     = require('underscore');

var Network = exports.Network = function Network(client, details) {
    base.Network.call(this, client, details);
};

util.inherits(Network, base.Network);

Network.prototype._setProperties = function (details) {
    this.id        = details.id;
    this.name      = details.name;
    this.status    = details.state;
    this.shared    = details.type.toUpperCase()=='SHARED' ? true : false ;
    //
    // Cloudstack specific
    //
    this.type   = details.type;
    this.zoneid  = details.zoneid;
    this.zonename  = details.zonename;
    this.projectId = details.projectid || this.projectId ;
    this.original = this.cloudstack = details;
};

Network.prototype.toJSON = function () {
    return _.pick(this, ['id', 'name', 'status', 'projectId', 'type', 'zoneid', 'zonename']);
};