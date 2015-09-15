module.exports = function(grunt) {
	grunt.initConfig({
		jshint: {
			options: {
				node: true,
				'-W004': true
			},
			all: {
				src: ['Gruntfile.js', 'lib/*.js', 'tests/*.js']
			}
		},
		mochaTest: {
			test: {
				src: ['test/*.js']
			}
		},
		uglify: {
			build: {
				files: {'src/mongode.min.js': ["lib/*.js"]}
			}
		},
		clean: {
			build: {
				src: ['src/mongode.min.js']
			}
		},
		watch: {
			all: {
				files: ['lib/*.js'],
				tasks: ['jshint', 'mochaTest', 'clean', 'uglify']
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['jshint', 'clean', 'uglify', 'mochaTest', 'watch']);
	grunt.registerTask('no-watch', ['jshint', 'clean', 'uglify', 'mochaTest']);
};
