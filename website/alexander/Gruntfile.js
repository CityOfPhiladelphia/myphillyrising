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
            dest: 'static/alexander/js/admin-components.min.js',
            src: [
              'static/components/jquery/jquery.min.js',
              'static/components/bootstrap/docs/assets/js/bootstrap.js',
              'static/components/underscore/underscore-min.js',
              'static/components/backbone/backbone-min.js',
              'static/components/backbone-relational/backbone-relational.js',
              'static/components/backbone.marionette/lib/backbone.marionette.js',
              'static/components/handlebars.js/dist/handlebars.js',
              'static/components/moment/moment.js',
              'static/components/select2/select2.js'
            ]
          },
          {
            dest: 'static/alexander/js/admin-app.min.js',
            src: [
              'static/alexander/js/django-csrf.js',
              '../myphillyrising/static/myphillyrising/js/utils.js',
              'static/alexander/js/utils.js',
              'static/alexander/js/handlebars-helpers.js',
              '../myphillyrising/static/myphillyrising/js/handlebars-helpers.js',
              'static/alexander/js/models.js',
              'static/alexander/js/admin-views.js'
            ]
          },
          {
            dest: 'static/alexander/js/modernizr.min.js',
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
        files: []
      }
    }
  });

  // Load the plugins
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Default task(s).
  grunt.registerTask('default', ['uglify', 'cssmin']);

};