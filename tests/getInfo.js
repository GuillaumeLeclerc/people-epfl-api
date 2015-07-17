var api = require("../index.js");
var util = require("util");
var fs = require("fs");
var async = require("async");
var lodash = require("lodash");

var testCasesFile = "./tests/testCases.txt";

module.exports = {
	testNotFound : function(test) {
		test.expect(1);
		api.getInfo("éaskdjfékjl kljfskldjfslfs sdf", function(error, result){
			test.ok(util.isError(error));
			test.done();
		});
	},

	testFromFile : function(test) {
		var textFile = fs.readFileSync(testCasesFile, {encoding : "utf8"});
		var lines = textFile.split("\n");
		lines.pop();
		test.expect( 3 * lines.length + 1);
		async.each(lines, function(line, callback) {
			var lineParts = line.split("-");
			lineParts = lodash.map(lineParts, function(value, index) {
				return value.trim();
			});
			var sciper = lineParts[0];
			var fullName = lineParts[1];
			var section = lineParts[2];
			var email = lineParts[3];
			api.getInfo(sciper, function(error, result) {
				if (error) return callback(error);
				test.deepEqual(result.email, email);
				test.deepEqual(result.sciper, sciper);
				lodash.each(result.roles, function(role, index) {
					if (role.role == "Student") {
						test.deepEqual(role.section, section);
					}
				});
				callback(null);
			});
		}, function(error, result) {
			test.ok(!error);
			test.done();
		});
	}
}
