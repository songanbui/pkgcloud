/*
 * server.js: Cloudstack "Virtual Machine"
 *
 * (C) 2014 Song An BUI
 *
 */

var util  = require('util'),
    base  = require('../../core/compute/server'),
    _     = require('underscore');

var Server = exports.Server = function Server(client, details) {
    base.Server.call(this, client, details);
};

util.inherits(Server, base.Server);

Server.prototype._setProperties = function (details) {
    this.id      = details.id;
    this.name    = details.name;
    this.hostId    = details.hostid;
    this.created = details.created;
    this.imageId = details.templateid;
    this.flavorId = details.serviceofferingid;

    // Standardizing vm's networks and IPs
    var publicAddresses = [],
        privateAddresses = [];
    if (details.nic && details.nic.length>0){
        var nicArray = details.nic;
        nicArray.forEach(function(nic){
            if (nic.ipaddress) { nic.addr = nic.ipaddress ; }
            if (nic.type && nic.type.toUpperCase()=='SHARED'){
                publicAddresses.push(nic);
            }
            else {
                privateAddresses.push(nic);
            }
        });
    }
    this.addresses = {
        public: publicAddresses,
        private: privateAddresses
    };

    // Standardizing vm's state
    if (details.state) {
        switch (details.state.toUpperCase()) {
            case 'STARTING':
                this.status = this.STATUS.provisioning;
                break;
            case 'REBOOTING':
                this.status = this.STATUS.reboot;
                break;
            case 'RUNNING':
                this.status = this.STATUS.running;
                break;
            case 'STOPPING':
            case 'STOPPED':
            case 'SHUTDOWNED':
                this.status = this.STATUS.stopped;
                break;
            case 'DESTROYED':
                this.status = this.STATUS.terminated;
                break;
            case 'EXPUNGING':
            case 'MIGRATING':
                this.status = this.STATUS.updating;
                break;
            case 'ERROR':
                this.status = this.STATUS.error;
                break;
            case 'UNKNOWN':
                this.status = this.STATUS.unknown;
                break;
        }
    }

    //
    // Cloudstack specific
    //
    this.displayname = details.displayname || details.name;
    this.original = this.cloudstack = details;
};

Server.prototype.toJSON = function () {
    return _.pick(this, ['id', 'name', 'hostId', 'created', 'imageId', 'flavorId', 'addresses', 'status', 'displayname']);
};