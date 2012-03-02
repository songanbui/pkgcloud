/*
 * instances-test.js: Tests for Rackspace Cloud Database instances
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var vows = require('vows'),
    assert = require('../../helpers/assert'),
    helpers = require('../../helpers');

var client = helpers.createClient('rackspace', 'database');

var testContext = {};

function assertLinks (links) {
  assert.isArray(links);
  links.forEach(function (link) {
    assert.ok(link.href);
    assert.ok(link.rel);
  });
}

vows.describe('pkgcloud/rackspace/databases/instances').addBatch({
  "The pkgcloud Rackspace database client": {
    "the create() method": {
     topic: function () {
      var self = this;
       client.getFlavor(1, function (err, flavor) {
        client.createInstance({
          name:'test-instance',
          flavor: flavor
        }, self.callback);
       });
     },
     "should return a valid instance": function(err, instance) {
      assert.isNull(err);
      assert.assertInstance(instance);
     },
     "should return the same name and flavor used": function (err, instance) {
      assert.isNull(err);
      assert.assertInstance(instance);
      assert.equal(instance.name, 'test-instance');
      assert.equal(instance.flavor.id, 1);
     }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace database client": {
    "the getInstances() method": {
      "with no details": {
        topic: function () {
          client.getInstances(this.callback);
        },
        "should return the list of instances": function (err, instances) {
          assert.isNull(err);
          assert.isArray(instances);
          assert.ok(instances.length > 0);
        },
        "should valid instance each item in the list": function (err, instances) {
          assert.isNull(err);
          instances.forEach(function (instance) {
            assert.assertInstance(instance);
          });
        }
      },
      "with details": {
        topic: function () {
          client.getInstances(true, this.callback);
        },
        "should return list status and details for all databases": function (err, instances) {
          assert.isNull(err);
          instances.forEach(function (instance) {
            assert.assertInstance(instance);
          });
        },
        "should have the extra info": function (err, instances) {
          assert.isNull(err);
          instances.forEach(function (instance) {
            assert.ok(instance.created);
            assert.ok(instance.hostname);
            assert.ok(instance.id);
            assert.ok(instance.updated);
            assert.isArray(instance.links);
            assert.isObject(instance.flavor);
          });
        },
        "should have correct flavor": function (err, instances) {
          assert.isNull(err);
          instances.forEach(function (instance) {
            assert.ok(instance.flavor.id);
            assertLinks(instance.flavor.links);
          });
        },
        "should have correct links": function (err, instances) {
          instances.forEach(function (instance) {
            assertLinks(instance.links);
          });
        }
      }
    }
  }
}).addBatch({
  "the destroyInstance() method": {
      topic: function () {
        var self = this;
        client.getInstances(function (err, instances) {
          var ready = instances.filter(function (instance) {
            return (instance.status == 'ACTIVE');
          });
          if (ready.length === 0) {
            console.log('ERROR:   Is necessary have Instances actived for test the destroy');
          }
          testContext.Instance = ready[0];
          client.destroyInstance(testContext.Instance, self.callback);
        });
      },
      "should respond correctly": function (err, res) {
        assert.isNull(err);
        assert.equal(res.statusCode, 202);
      }
    }
}).addBatch({
  "The pkgcloud Rackspace database client": {
    "the getInstance() method": {
      topic: function () {
        client.getInstance(testContext.Instance.id, this.callback);
      },
      "should response with details": function (err, instance) {
        assert.isNull(err);
        assert.ok(instance);
        assert.assertInstance(instance);
      }
    }
  }
}).export(module);
