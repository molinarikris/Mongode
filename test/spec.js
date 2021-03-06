var assert = require('assert');
var dbConstructor = require('../src/mongode.min.js');

describe('Mongode', function(){
	it('should construct a wrapper with two parameters and an options object', function() {
		var dummy = new dbConstructor('test', 'controller', {});
		assert.equal(6, Object.keys(dummy).length);
	});
	it('should construct a wrapper with one object containing the dbName and colName', function(){
		var dummy2 = new dbConstructor({
			dbName: 'test',
			colName: 'controller'
		});
		assert.equal(6, Object.keys(dummy2).length);
	});
	it('should throw an error when neither occurence happens', function(){
		assert.throws(function() {
			var badDummy = new dbConstructor('just a dbName with no colName');
		});
		assert.throws(function() {
			var badDummy = new dbConstructor({
				no: "dbName or colName as properties",
				should: "throw an error"
			});
		})
	});
	it('should accept an option parameter for indexing the collection', function(done) {
		var dummy = new dbConstructor('test', 'indexedCollection', {indexed: true});
		dummy.create({test: "pass"}, function(err, res) {
			dummy.read({}, function(err, docs) {
				dummy.delete({}, function(err) {
					assert(Object.keys(docs[0]).indexOf('index') + 1);
					done();
				});
			});
		});
	});

	// the db object to be used throughout this test-enviornment.
	var db = new dbConstructor('test', 'controller');

	describe('#connection', function() {
		it('should connect without error and return non-empty database object', function(done) {
			db.connection(function(err, db){
				assert.equal(null, err);
				assert.notEqual(0, Object.keys(db).length);
				done();
			})
		});
		it('should maintain the original connection while connecting to secondary db', function(done){
			var db2 = new dbConstructor('test2', 'controllers');
			db2.connection(function(err, db){
				assert.equal(null, err);
				assert.equal('test2', db.s.databaseName);
			});
			db.connection(function(err, db){
				assert.equal(null, err);
				assert.equal('test', db.s.databaseName);
				done();
			})
		})
	});



	describe('#create', function(){
		it('should make a new database entry with no error', function(done){
			db.create({"test": "pass", "a": 1}, function(err, res){
				assert.equal(null, err);
				assert.equal(1, res.result.n);
				assert.equal(1, db.count);
				done();
			});
		});
		it('should take an array of data and insert it...with no error', function(done){
			db.create([{"another test": "pass"}, {"yet another test": "pass"}, {"test":"pass", "a": 2}], function(err, res){
				assert.equal(null, err);
				assert.equal(3, res.result.n);
				done();
			});
		});
		it('should be able to insert a document without specifying a callback', function(done){
			var promise = db.create([{"test":"test"}, {"test":"test"}]);
			promise(function(res) {
				assert.equal(res.result.ok, 1);
				assert.equal(res.result.n, 2);
				done();
			})
		})
	});
	describe('count', function() {
		it('should return the count of documents in the current collection', function() {
			assert.equal(6, db.count);
		})
	})
	describe('#read', function(){
		it('should create an array of all database entries given no query', function(done){
			db.read(function(err, docs){
				assert.equal(null, err);
				assert.equal(6, docs.length);
				done();
			})
		});
		it('should create an array of matches according to a mongodb query', function(done){
			db.read({"a":{$exists: true}}, function(err, docs){
				assert.equal(null, err);
				assert.equal(2, docs.length);
				done();
			})
		})
	});

	describe('#update', function() {
		it('should find a db entry and modify it without error', function(done){
			db.update({"test": {$exists:true}}, {"$set": {"second test": "pass"}}, function(err, res){
				assert.equal(null, err);
				assert.equal(true, res.result.n >= 1);
				assert.equal(true, res.result.nModified >= 1);
				done();
			})
		})
	});

	describe('#aggregate', function() {
		it('should run pipeline-based stats on a collection', function(done) {
			db.aggregate([{
				$group: {
					_id: "$test",
					frequency: {$sum: 1}
				}
			}, {
				$sort: {
					_id: -1
				}
			}
			], {}, function(err, res) {
				assert.equal(err, null);
				assert.equal(res[0].frequency, 2);
				assert.equal(res[0]._id, "test");
				done();
			})
		})
	});

	describe('#delete', function(){
		it('should remove according to a mongo query.', function(done) {
			db.delete({"a": 1}, function(err, res) {
				assert.equal(null, err);
				assert.equal(true, res.result.n >= 1);
				done();
			});
		});
		it('should remove everything according to an empty mongo query', function(done){
			db.delete({}, function(err, res){
				assert.equal(null, err);
				assert.equal(true, res.result.n >= 1);
				done();
			})
		})
	})

});
