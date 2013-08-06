module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      dist: {
        files: [
          {
            dest: 'static/js/components.min.js',
            src: [
              'static/components/jquery/jquery.js',
              'static/components/underscore/underscore-min.js',
              'static/components/backbone/backbone.js',
              'static/components/backbone.marionette/lib/backbone.marionette.js',
              'static/components/handlebars.js/dist/handlebars.js',
              'static/components/moment/moment.js',
              'static/components/leaflet/dist/leaflet.js',
              'static/components/leaflet-vector-layers/dist/lvector.js'
            ]
          },
          {
            dest: 'static/js/app.min.js',
            src: [
              'static/js/handlebars-helpers.js',
              'static/js/config.js',
              '../alexander/static/js/utils.js',
              '../alexander/static/js/models.js',
              '../alexander/static/js/django-csrf.js',
              'static/js/views.js',
              'static/js/app.js'
            ]
          },
          {
            dest: 'static/js/modernizr.min.js',
            src: [
              'static/components/modernizr/modernizr.js'
            ]
          }
        ]
      }
    },
    cssmin: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      dist: {
        files: [
          {
            dest: 'static/css/components.min.css',
            src: [
              'static/components/normalize-css/normalize.css',
              'static/components/leaflet/dist/leaflet.css'
            ]
          },
          {
            dest: 'static/css/styles.min.css',
            src: [
              'static/css/styles.css'
            ]
          }
        ]
      }
    }
  });

  // Load the plugins
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Default task(s).
  grunt.registerTask('default', ['uglify', 'cssmin']);

};