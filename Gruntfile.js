module.exports = function(grunt) {

  var config = require('./.screeps.json')

  grunt.loadNpmTasks('grunt-screeps')
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-file-append')

  var currentDate = new Date();

  grunt.log.subhead('Task Start: ' + currentDate.toLocaleString())
  grunt.log.writeln('Branch: ' + config.branch)

  grunt.initConfig({
    screeps: {
      options: {
        email: config.email,
        password: config.password,
        branch: grunt.option('branch') || config.branch,
        ptr: config.ptr
      },
      dist: {
        src: ['dist/*.js']
      }
    },

    clean: {
      'dist': ['dist']
    },

    copy: {
      screeps: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: '**',
          dest: 'dist/',
          filter: 'isFile',
          rename: function(dest, src) {
            return dest + src.replace(/\//g,'.');
          }
        }],
      }
    },

    file_append: {
      versioning: {
        files: [
          {
            append: "\nglobal.SCRIPT_VERSION = " + currentDate.getTime() + "\n",
            input: 'dist/version.js',
          }
        ]
      }
    },
  })

  grunt.registerTask('default', ['clean','copy:screeps', 'file_append', 'screeps']);
}
