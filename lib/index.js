var mongo = require('mongodb').MongoClient;
var assert = require('assert');


// Opening require() takes two arguments, db and collection.
var dbConfig = function(db, collection, opts) {
    var dbName = db;
    var col = collection;



    return {

		connection: function(callback) {
			mongo.connect('mongodb://localhost:27017/' + dbName, function(err, db) {
				if (err) callback(err);
				else callback(null, db);
			});
		},
	
		// query must be a valid mongoDB query. 
		// e.g. 
			// db.getData({"age": {"$gt": 21}} , callback(err, docs) {...})
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
	
		count: function(callback) {
			this.connection(function(err, db) {
				db.collection(col).find().count(function(err, count) {
					callback(err, count);
				});
			});
		},
	
		// data must be valid JSON syntax
	
		create: function(data, callback) {
			this.connection(function(err,db) {
				if (err) {
					callback(err);
				} else{
					db.collection(col).insert(data, function(err, result){
						if (err) {
							callback(err);
						} else {
							callback(null, result);
						}
					});
				}
			});	
		},
		
		delete: function(query, callback) {
			this.connection(function(err,db) {
				if (err) {
					callback(err);
				}
				else if (!callback && typeof query === 'function') {
					query(new Error("You cannot use delete without a valid query"	));
				} else if (typeof query === 'object' && query && typeof callback === 'function') {
					db.collection(col).remove(query, function(err, result) {
						if (err) {
							callback(err);
						} else {
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
					db.collection(col).update(params, data, opt, function(err, result){
						if (err) {
							callback(err);
						} else {
							callback(null, result);
						}
					});
				}
			});
		}
    };
};
	
module.exports = dbConfig;