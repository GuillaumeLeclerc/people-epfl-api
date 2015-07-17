module.exports = function(grunt) {
	grunt.initConfig({
		nodeunit : {
			all : ['tests/*.js'],
			options : {
				reporter : "default"
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-nodeunit");
	grunt.registerTask("test", ["nodeunit"]);

}
