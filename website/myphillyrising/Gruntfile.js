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
            dest: 'static/myphillyrising/js/components.min.js',
            src: [
              'static/components/jquery/jquery.js',
              'static/components/underscore/underscore-min.js',
              'static/components/backbone/backbone.js',
              'static/components/backbone.marionette/lib/backbone.marionette.js',
              'static/components/backbone-relational/backbone-relational.js',
              'static/components/handlebars.js/dist/handlebars.js',
              'static/components/moment/moment.js',
              'static/components/leaflet/dist/leaflet.js',
              'static/components/leaflet-vector-layers/dist/lvector.js'
            ]
          },
          {
            dest: 'static/myphillyrising/js/app.min.js',
            src: [
              '../alexander/static/alexander/js/utils.js',
              '../alexander/static/alexander/js/models.js',
              '../alexander/static/alexander/js/django-csrf.js',
              'static/myphillyrising/js/utils.js',
              'static/myphillyrising/js/handlebars-helpers.js',
              'static/myphillyrising/js/config.js',
              'static/myphillyrising/js/utils.js',
              'static/myphillyrising/js/models.js',
              'static/myphillyrising/js/views.js',
              'static/myphillyrising/js/app.js'
            ]
          },
          {
            dest: 'static/myphillyrising/js/modernizr.min.js',
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
            dest: 'static/myphillyrising/css/components.min.css',
            src: [
              'static/components/normalize-css/normalize.css',
              'static/components/leaflet/dist/leaflet.css',
              'static/components/hint.css/hint.css'
            ]
          },
          {
            dest: 'static/myphillyrising/css/styles.min.css',
            src: [
              'static/myphillyrising/css/styles.css'
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