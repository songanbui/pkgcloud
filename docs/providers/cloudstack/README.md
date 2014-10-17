## Using the Cloudstack provider in pkgcloud

Apache Cloudstack doesn't fragment their APIs in distinct services. Separating their APIs in services is thus done arbitrarily.
The Cloudstack provider in pkgcloud currently supports the following services:

* [**Compute**](compute.md) - Servers (virtual machines) | Images (templates) | Flavors (service offerings)
* [**Network**](network.md) - Networks

### Authentication

For all of the Openstack services, you create a client with the same options:

```Javascript
var client = require('pkgcloud').compute.createClient({
    provider: 'cloudstack',
    apiUri: 'https://your-cloudstack-api-uri',
    apiKey: 'your-cloudstack-apiKey',
    apiSecret: 'your-cloudstack-apiSecret'
});
```

All of the Cloudstack `createClient` calls have a few options that can be provided:

#### Project ID

`projectId` specifies which project of your Cloudstack platform to use

##### Specifying a custom region

```Javascript
var client = require('pkgcloud').compute.createClient({
    provider: 'cloudstack',
    apiUri: 'https://your-cloudstack-api-uri',
    apiKey: 'your-cloudstack-apiKey',
    apiSecret: 'your-cloudstack-apiSecret',
    projectId: 'your-project-id'
});
```
