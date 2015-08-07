var assert = require('assert');
var db = new require('../src/mongode.min.js')('test', 'controllers');

describe('Mongode', function(){
	describe('#connection', function() {
		it('should connect without error and return non-empty database object', function(done) {
			db.connection(function(err, db){
				assert.equal(null, err);
				assert.notEqual(0, Object.keys(db).length);
				done();
			})
		});
	});
	describe('#create', function(){
		it('should make a new database entry with no error', function(done){
			db.create({"test": "pass", "a": 1}, function(err, res){
				assert.equal(null, err);
				assert.equal(1, res.result.n);
				done();
			});
		});
		it('should take an array of data and insert it...with no error', function(done){
			db.create([{"another test": "pass"}, {"yet another test": "pass"}, {"test":"pass", "a": 2}], function(err, res){
				assert.equal(null, err);
				assert.equal(3, res.result.n);
				done();
			});
		})
	});
	describe('#read', function(){
		it('should create an array of all database entries given no query', function(done){
			db.read(function(err, docs){
				assert.equal(null, err);
				assert.equal(4, docs.length);
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
				
				done();
			})
		})
	});
	describe('#delete', function(){
		it('should remove everything according to an empty mongo query', function(done){
			db.delete({}, function(err, res){
				assert.equal(null, err);
				assert.equal(true, res.result.n >= 1);
				done();
			})
		})
	})
});