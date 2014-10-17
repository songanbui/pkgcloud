/*
 * images.js: Implementation of Cloudstack Images Client.
 *
 * (C) 2014, Song An BUI
 *
 */
var pkgcloud = require('../../../../../lib/pkgcloud'),
    base     = require('../../../core/compute'),
    compute  = pkgcloud.providers.cloudstack.compute;

/**
 * client.getImages
 *
 * @description get an array of images for the current account
 *
 * @param {object|Function}   [options]                     A set of options for the getImages call
 * @param {String}            [options.templateFilter]      A filter for listing templates || default: self-executable
 * @param {function}          callback                      f(err, images) where images is an array of Image
 * @returns {*}
 */
exports.getImages = function(options, callback) {
    var self = this;
    if (typeof options === 'function') {
        callback = options;
        options = { templateFilter: 'selfexecutable' };
    } else {
        options.templateFilter = options.templateFilter || 'selfexecutable';
    }
    return this._request({
        cmd: 'listTemplates',
        params: options
    }, function (err, body) {
        if (err) {
            return callback(err);
        }
        if (!body || !body.template) {
            return callback(new Error('Unexpected empty response'));
        }
        else {
            return callback(null, body['template'].map(function (images) {
                return new compute.Image(self, images);
            }));
        }
    });
};

/**
 * client.getImage
 *
 * @description get an image for the current account
 *
 * @param {String|object}     image         the image or imageId to get
 * @param {function}          callback      f(err, image)
 * @returns {*}
 */
exports.getImage = function(image, callback) {
    var self = this,
        imageId = image instanceof base.Image ? image.id : image;
    return this._request({
        cmd: 'listTemplates',
        params: {
            templateFilter: 'selfexecutable',
            id:imageId
        }
    }, function (err, body) {
        if (err) {
            return callback(err);
        }
        if (!body || !body['template']) {
            return callback(new Error('Unexpected empty response'));
        }
        else {
            var image = body['template'].filter(function (image) {
                return image.id == imageId;
            })[0];
            return !image
                ? callback(new Error('No image found with id: ' + imageId))
                : callback(null, new compute.Image(self, image));
        }
    });
};