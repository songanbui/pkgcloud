##Using the Cloudstack Compute provider

Creating a client is straight-forward:

```Javascript
var client = require('pkgcloud').compute.createClient({
    provider: 'cloudstack',
    apiUri: 'https://your-cloudstack-api-uri',
    apiKey: 'your-cloudstack-apiKey',
    apiSecret: 'your-cloudstack-apiSecret'
});
```

[More options for creating clients](README.md)

### API Methods

Several Cloudstack API methods are asynchronous and generates a job. Cloudstack provides a common method API to retrieve jobs, thus allowing to track the progress of any asynchronous methods.

As such, the Cloudstack provider in pkgcloud is developed so that asynchronous methods can return continuously a job, then return the final result once the job is completed. This is optionnally done by providing a progressCallback function, along the standard callback.

Example: createServer (Cloudstack's deployVirtualMachine) returns continuously a job id. The job, once completed, contains all the server information from Cloudstack (i.e. not only the user-specified options).


### Servers (Virtual Machines)

#### client.getServers(callback)
Lists all servers that are available to use on your Cloudstack account

Returns an array of servers in the callback `f(err, servers)`

#### client.getServer(server, callback)

Gets specified server

Takes server or serverId as an argument and returns the server in the callback `f(err, server)`

#### client.createServer(options, callback, progressCallback)

_Asynchronous method_

Creates a server with the options specified

Options are as follows:

```js
{
  name: 'serverName', // required
  flavor: 'flavor1',  // required - {object|String}  service offering
  image: 'image1',    // required - {object|String}  template
  zone: 'zone1',      // optional - {object|String}  zone | default: zone where template is deployed
  networksids: []     // optional - {Array|String}   array of networks | default: network where zone is deployed
}
```
Returns a server object generated with specified options in the callback `f(err, server)`
(A): Returns a server object generated with complete Cloudstack information in the callback `f(err, server)`

#### client.destroyServer(server, callback, progressCallback)

_Asynchronous method_

Destroys the specified server

Takes server or serverId as an argument and returns the job in the callback `f(err, job)`
(A): Takes server or serverId as an argument and returns the job in the progressCallback `f(err, job)` and a server generated with job results in the callback `f(err, server)`

#### client.rebootServer(server, callback, progressCallback)

_Asynchronous method_

Reboots the specifed server with options

Takes server or serverId as an argument and returns the job in the callback `f(err, job)`
(A): Takes server or serverId as an argument and returns the job in the progressCallback `f(err, job)` and a server generated with job results in the callback `f(err, server)`

#### client.startServer(server, callback, progressCallback)

_Asynchronous method_

Starts the specifed server with options

Takes server or serverId as an argument and returns the job in the callback `f(err, job)`
(A): Takes server or serverId as an argument and returns the job in the progressCallback `f(err, job)` and a server generated with job results in the callback `f(err, server)`

#### client.stopServer(server, callback, progressCallback)

_Asynchronous method_

Stops the specifed server with options

Takes server or serverId as an argument and returns the job in the callback `f(err, job)`
(A): Takes server or serverId as an argument and returns the job in the progressCallback `f(err, job)` and a server generated with job results in the callback `f(err, server)`


### Images (Templates)

#### client.getImages(callback)
Lists all images that are available to use on your Cloudstack account

Returns an array of images in the callback `f(err, images)`

#### client.getImage(image, callback)

Gets specified image

Takes image or imageId as an argument and returns the image in the callback `f(err, image)`


### Flavors (Service Offerings)

#### client.getFlavors(callback)
Lists all flavors that are available to use on your Cloudstack account

Returns an array of flavors in the callback `f(err, flavors)`

#### client.getFlavor(flavor, callback)

Gets specified flavor

Takes flavor or flavorId as an argument and returns the flavor in the callback `f(err, flavor)`