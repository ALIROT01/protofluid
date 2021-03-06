module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-mustache');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
     test: {
         files: [
             { src: ['Scripts/*'], dest: ['//location/site/Scripts/'] }
         ]
     }
},
    concat: {
    js: {
        src: [
            '_i_APP.js'
        ],
        dest: 'combined.js'
    }
},
    uglify: {
      my_target: {
        files: {
          '_/js/script.js': ['_d*.js'] //dude for testing
        } //files
      } //my_target
    }, //uglify
    compass: {
      dev: {
        options: {
          config: 'config.rb'
        } //options
      } //dev
    }, //compass
    mustache: {
        files : {
            src: 'html',
            dest: 'js/html/templates.js',
            options: {
                prefix: 'jwt.templates = ',
                postfix: ';',
                verbose: true
            }
        }
    },
    watch: {
      options: { livereload: true },
      scripts: {
        files: ['_/components/js/*.js' , '*.js' ],
        tasks: ['concat','uglify']
      }, //script
      sass: {
        files: ['sass/*.scss'],
        tasks: ['compass:dev']
      }, //sass
      mustache: {
          files: ['html/*.*'],
          tasks: ['mustache']
      }, //mustache
      html: {
        files: ['*.html' , '*.js']
      }
    } //watch
  }) //initConfig
  grunt.registerTask('default', 'watch' );
} //exports
