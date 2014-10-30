/*
 * flavor.js: Cloudstack "Service Offering"
 *
 * (C) 2014 Song An BUI
 *
 */

var util  = require('util'),
    base  = require('../../core/compute/flavor'),
    _     = require('underscore');

var Flavor = exports.Flavor = function Flavor(client, details) {
  base.Flavor.call(this, client, details);
};

util.inherits(Flavor, base.Flavor);

Flavor.prototype._setProperties = function (details) {
  this.id = details.id;
  this.name = details.name;
  this.ram = details.memory;
  this.vcpus = details.cpunumber;

  //
  // Cloudstack specific
  //
  this.cpuspeed = details.cpuspeed;
  this.original = this.cloudstack = details;
};

Flavor.prototype.toJSON = function () {
  return _.pick(this, ['id', 'name', 'ram', 'vcpus', 'cpuspeed']);
};