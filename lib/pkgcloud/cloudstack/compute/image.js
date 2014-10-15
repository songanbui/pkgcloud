/*
 * image.js: Cloudstack "Template"
 *
 * (C) 2014 Song An BUI
 *
 */

var util  = require('util'),
    base  = require('../../core/compute/image'),
    _     = require('underscore');

var Image = exports.Image = function Image(client, details) {
    base.Image.call(this, client, details);
};

util.inherits(Image, base.Image);

Image.prototype._setProperties = function (details) {
    this.id      = details.id;
    this.name    = details.name;


    //
    // Cloudstack specific
    //
    this.zoneid  = details.zoneid;
    this.zonename = details.zonename;
    this.status   = details.status;
    this.original = this.cloudstack = details;
};

Image.prototype.toJSON = function () {
    return _.pick(this, ['id', 'name', 'status', 'created', 'zoneid', 'zonename']);
};