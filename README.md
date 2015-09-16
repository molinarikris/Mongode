# Mongode2 ![build status](https://travis-ci.org/molinarikris/Mongode.svg?branch=master)
_Get your MongoDB--Node.js project off the ground faster._

This wrapper builds on top of the [node-mongodb-native](https://github.com/mongodb/node-mongodb-native) driver with prepackaged methods for quick and simple CRUD access to MongoDB from your Node.js project (along with some other toys).


## Install

To install in your local project,

    $ npm install mongode2 # Another unmaintained package uses the same name

Then in your project:

    var db = new require('mongode2')('yourDbName', 'yourCollectionName');
    // Use of the 'new' constructor allows you to maintain connections to multiple dbs/collections
    var db2 = new require('mongode2')('anotherDbName', 'anotherCollectionName');

## API

### Class

#### db(opts)

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
hostname|String|`'localhost'`|A valid hostname.
port|String|`'27017'`|A valid port, preferably stored as a number, not a string.

### db properties

#### db.count

Mongode keeps a cached count of how many entries are in the database stored in the .count property.

### db methods

#### db.create(data [, callback]);

Insert `data` into the collection.

    var Mongode = require('mongode2');
    var db = new Mongode("db", "collection");

    db.create({"foo": "bar", "testing": true}, function(err) {
        // Hooray!
        if (err) {
          console.log("Nice error handling!");
        }
    });

Argument | Type | Description
:----------|:---------|------------:
`data` | Object | The document you want to insert.
`callback` | Function | **Optional** Function to be executed upon completion.

`callback()` takes two parameters, `err` and `res`. If `callback()` is omitted, any error occurring **will be thrown**. It is highly recommended to use at least define `callback(err)` to handle the error and prevent crash-ridden, hard-to-debug database calls.
* `err` -- The error object. If no error, this value will be `null`; otherwise `object`.
* `res` -- The [writeOpResult object](http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#~WriteOpResult). Contains useful diagnostic information like:
  * `res.result.n`: number of documents the operation *actually* inserted,

#### db.read([query,] callback)

Request all documents (no `query`) or all documents matching `query`.

    // continuing from above:
    db.read(/* Empty query means read all \*/, function(err, docs) {
        console.log(docs);
        // [{foo: "bar", testing: true}]
        // note it returned an array, even though there was only one entry.
    });

Argument | Type | Description
:----------|:---------|------------:
`query` | Object(search Query) | An object containing a valid mongoDB query.
`callback` | Function | The callback function containing the result of db.read.

If you're unsure about mongoDB's search queries, read up [here](http://docs.mongodb.org/v2.6/reference/operator/query/#query-selectors).

`callback` takes two parameters,
* `err` for the error object if there is one (otherwise `null`) and
* `docs`, an *array* containing the array of docs from your query.
**Important note:** even if the collection has only one entry, `docs` will be an array. Accessing properties of an array, e.g. `docs.foo` will return undefined. Access document properties inside the array, `docs[0].foo`.
You have been warned.

#### db.update(query, data, [opts,] callback)

Update a document matching `query` with `data`.

    db.update({"foo": {$exists: true}}, {$set: {"modified": "yep"}}, function(err, res) {
        /* Our doc is now  {
          foo: "bar",
          testing: true,
          modified: "yep"
        } \*/
        console.log(res.result.nModified);
        // 1
    });

Argument | Type | Description
:----------|:---------|------------:
`query`|Object(search Query)|An object containing a valid mongoDB search query.
`data`|Object(update Query)|An object containing a valid mongoDB update query.
`opts`|Object| *optional* An object for `multi` and `upsert` options.
`callback`|Function|The callback function with the error object if there was one.

If you're not sure about mongoDB's update queries, read up on them [here](https://docs.mongodb.org/manual/reference/operator/update/).

If you want to update multiple docs or upsert on no matches, specify them in the options object.

    var opts = {
      multi: true, // false by default
      upsert: true // false by default
    };

`callback` takes two parameters
* `err`: the error object (otherwise null) and
* `res`: which is the result from MongoDB.

_More documentation to come!_
