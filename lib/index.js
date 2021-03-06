var mongo = require('mongodb').MongoClient;
var q = require('deferred');

// Construction can take two arguments, db and collection with an optional object of options, or one object with dbName and colName as properties and options set.
var dbConfig = function(db, collection, opts) {
	var col, dbName;
	this.count = 0;
	var indexed = false;
	if (typeof db === 'string' && typeof collection === 'string') {
    	dbName = db;
    	col = collection;
    	if (opts) {
				indexed = opts.indexed || false;
    		var conOpts = {
    			hostname: opts.hostname || 'localhost',
    			port: opts.port || '27017',
    			uri_decode_auth: opts.uri_decode_auth || false,
    			db: opts.db || null,
    			server: opts.server || null,
    			replSet: opts.replSet || null,
    			mongos: opts.mongos || null,
    			promiseLibrary: opts.promiseLibrary || null
    		};
				// Don't index collections by default.
    	} else {
    		var conOpts = {
    			hostname: 'localhost',
    			port: '27017'
    		};
    	}
	} else if (typeof db === 'object' && db.colName && db.dbName) {
		var conOpts = {
    		hostname: db.hostname || 'localhost',
    		port: db.port || '27017',
    		uri_decode_auth: db.uri_decode_auth || false,
    		db: db.db || null,
    		server: db.server || null,
    		replSet: db.replSet || null,
    		mongos: db.mongos || null,
    		promiseLibrary: db.promiseLibrary || null
    	};
		indexed = db.indexed || false;
    col = db.colName;
    dbName = db.dbName;
	} else {
		throw new Error('Mongode: constructor requires a database and collection name passed as a single object \nrequire(\'mongode2\')({\ndbName: \'your db name\',\ncolName: \'your collection name\'\n})\n or as two string parameters followed by an optional options object.\n require(\'mongode2\')(\'your db name\', \'your collection name\')\nI didn\'t quite get that.');
	}

    return {

		connection: function(callback) {
			var that = this;
			mongo.connect('mongodb://' + conOpts.hostname + ':' + conOpts.port + '/' + dbName, conOpts, function(err, db) {
				if (err) callback(err);
				else {
					if (!that.count) {
						db.collection(col).count({}, function(err, res) {
							that.count = res;
							callback(null, db);
						});
					} else {
						callback(null, db);
					}
				}
			});
		},

		// query must be a valid mongoDB query.
		// e.g.
		//   db.getData({"age": {"$gt": 21}} , callback(err, docs) {...})
		// docs param is an array containing each entry (objects) with the age 	field having a value greater than 21.

		read: function(query, callback) {
			this.connection(function(err, db) {
				if (err) {
					callback(err);
				} else if (typeof query === 'object' && query) {
					db.collection(col).find(query).toArray(function(err, docs) {
						if (err) {
							callback(err);
						} else {
							callback(null, docs);
						}
					});
				} else if (typeof query === 'function') {
					db.collection(col).find().toArray(function(err, docs){
						if (err) {
							query(err);
						} else {
							query(null, docs);
						}
					});
				} else {
					db.collection(col).find().toArray(function(err, docs){
						if (err) {
							callback(err);
						} else {
							callback(null, docs);
						}
					});
				}
			});
		},

		// data must be valid JSON syntax

		create: function(data, callback) {
			var defer = q();
			var that = this;
			this.connection(function(err,db) {
				if (err) {
					callback(err);
				} else if (callback) {
					if (indexed) {
						data.index = that.count;
					}
					db.collection(col).insert(data, function(err, result){
						if (data.length) {
							that.count += data.length;
						} else {
							that.count++;
						}
						if (err) {
							callback(err);
						} else {
							callback(null, result);
						}
					});
				} else {
					if (indexed) {
						console.log("We're indexing here.");
						data.index = that.count;
					}
					db.collection(col).insert(data, function(err, result){
						if (err) {
							defer.reject(err);
						} else {
							if (data.length) {
								that.count += data.length;
							} else {
								that.count++;
							}
							defer.resolve(result);
						}
					});
				}
			});
			return defer.promise;
		},

		delete: function(query, callback) {
			var that = this;
			this.connection(function(err,db) {
				if (err) {
					callback(err);
				}
				else if (!callback && typeof query === 'function') {
					query(new Error("You cannot use delete without a valid query"));
				} else if (typeof query === 'object' && query && typeof callback === 'function') {
					db.collection(col).remove(query, function(err, result) {
						if (err) {
							callback(err);
						} else {
							that.count = that.count - result.result.n;
							callback(null, result);
						}
					});
				}
			});
		},

		update: function(params, data, opts, callback) {
			this.connection(function(err,db) {
				var opt;
				if (err) {
					callback(err);
				} else if (typeof opts === 'function') {
					opt = {
						upsert: false,
						multi: true
					};
					db.collection(col).update(params, data, opt, function(err, result)	 {
						if (err) {
							opts(err);
						} else {
							opts(null, result);
						}
					});
				} else {
					opt = {
						upsert: opts.upsert || false,
						multi: opts.multi || true
					};
					db.collection(col).updateOne(params, data, opt, function(err, result){
						if (err) {
							callback(err);
						} else {
							callback(null, result);
						}
					});
				}
			});
		},

		aggregate: function(pipe, opts, callback) {
			this.connection(function(err, db) {
				db.collection(col).aggregate(pipe, function(err, docs) {
					if (err) {
						callback(err);
					} else {
						callback(null, docs);
					}
				});
			});
		}
    };
};

module.exports = dbConfig;
