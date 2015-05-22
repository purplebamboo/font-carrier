module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    qunit: {
      all: [ 'test/*.html' ]
    },

    watch: {
      files: [ 'test/tests/*.js', 'test/*.html', '*.js', 'samples/*.js' ],
      tasks: [ 'clean', 'qunit', 'concat', 'copy', 'uglify' ]
    },

    uglify: {
      options: {
        report: 'gzip',
        banner: '/*\n * JSFace Object Oriented Programming Library.\n * Copyright (c) 2009-2013 Tan Nhu, http://lnkd.in/tnhu\n */\n'
      },
      my_target: {
        files: {
          'dist/jsface.min.js':          [ 'jsface.js' ],
          'dist/jsface.ready.min.js':    [ 'jsface.ready.js' ],
          'dist/jsface.pointcut.min.js': [ 'jsface.pointcut.js' ],
          'dist/jsface.all.min.js':      [ 'jsface.js', 'jsface.ready.js', 'jsface.pointcut.js' ]
        }
      }
    },

    clean: [ 'dist/*' ],

    copy: {
      main: {
        files: [
          { src: [ './jsface.js', './jsface.pointcut.js', './jsface.ready.js' ], dest: 'dist/', filter: 'isFile' }
        ]
      }
    },

    concat: {
      dist: {
        src : [ 'jsface.js', 'jsface.ready.js', 'jsface.pointcut.js' ],
        dest: 'dist/jsface.all.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', [ 'clean', 'qunit', 'concat', 'copy', 'uglify' ]);
};