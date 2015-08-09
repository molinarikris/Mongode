# Mongode2 ![build status](https://travis-ci.org/molinarikris/Mongode.svg?branch=master)
_Get your MongoDB--Node.js project off the ground faster._

This wrapper builds on top of the [node-mongodb-native](https://github.com/mongodb/node-mongodb-native) driver with prepackaged methods for quick and simple CRUD access to MongoDB from your Node.js project. **This is used specifically for client operations, not server operations**.

----------

## Install
----

To install in your local project, 

    $ npm install mongode2 # Another unmaintained package uses the same name

Then in your project:

    var db = new require('mongode2')('yourDbName', 'yourCollectionName');
    // Use of the 'new' constructor allows you to maintain connections to multiple dbs/collections
    var db2 = new require('mongode2')('anotherDbName', 'anotherCollectionName');

## API
----

### db(opts)

The wrapper class. Should be invoked with `new` or as a constructor function:

    var dbFactory = require('mongode2');
    // using `new`
    var db = new dbFactory({
        dbName: 'database name',
        colName: 'collection name'
    });
    // using as a constructor
    var db2 = dbFactory('otherDb', 'otherCollection');
    // both are equivalent.

Argument | Type | Description
------|------|------:
`dbName`| String | Name of the database you want to connect to. This is appended to a MongoURI, which means **if you have to authenticate or for some reason.
`collectionName`| String | Name of the collection you want to connect to.
`opts`| Object | **Optional** An object of various options.

`opts` object:

Value | Type | Default | Description
------|------|:----:|-----:
hostname|String or Number|`'localhost'`|A valid hostname or IP.
port|String or Number|`'27017'`|A valid port, preferably stored as a number, not a string.
username|String|`null`|If your mongoDB requires authentication, specify a username here.
password|

### db.create(data [, callback]);

Insert `data` into the collection.

Argument | Type | Description
:----------|:---------|------------:
`data` | Object | The document you want to insert.
`callback` | Function | **Optional** Function to be executed upon completion.

`callback()` takes two parameters, `err` and `res`. If `callback()` is omitted, any error occuring **will be thrown**. It is highly recommended to use at least define `callback(err)` to handle the error and prevent crash-ridden, hard-to-debug database calls.
* `err` -- The error object. If no error, this value will be `null`; otherwise `object`.
* `res` -- The [writeOpResult object](http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#~WriteOpResult). Contains useful diagnostic information like: 
  * `res.result.n`: number of documents the operation *actually* inserted,

### db.read([query,] callback)

Request all documents (no `query`) or all documents matching `query`.

_More documentation to come!_
