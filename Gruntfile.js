module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: {
      scripts: {
        files: ['*.js'],
        tasks: ['browserify', 'uglify']
      }
    },
    browserify: {

      dist: {
        files: {
          'scripts/utm.js': ['script.js'],
        }
      }
    },
    uglify: {
      dist: {
        files: {
          'scripts/utm.min.js': ['scripts/utm.js']
        }
      }
    },

    replace: {
      test: {
        options: {
          patterns: [
            {
              match: /"utmbuilder.net"/,
              replacement: '"test.utmbuilder.net"'
            }
          ]
        },
        files: [
          {src: ['aws-upload.conf.js'], dest: 'aws-upload.conf.js'}
        ]
      },
      prod: {
        options: {
          patterns: [
            {
              match: /"test.utmbuilder.net"/,
              replacement: '"utmbuilder.net"'
            }
          ]
        },
        files: [
          {src: ['aws-upload.conf.js'], dest: 'aws-upload.conf.js'}
        ]
      }
    },
    shell: {
      compileHarp: {
        command: "harp compile . && cp aws-upload.conf.js www/ && cd www/ && s3-upload",
      }
    },
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task that generates development build
  grunt.registerTask('default', [
   'browserify', 'uglify'
  ]);

  grunt.registerTask('test', [
   'replace:test', 'shell'
  ]);

  grunt.registerTask('prod', [
   'replace:prod', 'shell'
  ]);

};
