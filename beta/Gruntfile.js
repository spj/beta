//Grunt is just JavaScript running in node, after all...
module.exports = function(grunt) {

  // All upfront config goes in a massive nested object.
  grunt.initConfig({
    // You can set arbitrary key-value pairs.
    scriptFolder: 'scripts/',
	cssFolder: 'content/css/',
	imgFolder: 'content/img/',
    // You can also set the value of a key as parsed JSON.
    // Allows us to reference properties we declared in package.json.
    pkg: grunt.file.readJSON('package.json'),
    // Grunt tasks are associated with specific properties.
    // these names generally match their npm package name.
      // Specify some options, usually specific to each plugin.
	clean: ["<%= scriptFolder %>**/*.min.js", "<%= cssFolder %>**/*.min.css"],
  uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        expand: true,
		cwd: '<%= scriptFolder %>',
		src: ['**/*.js', '!**/*.min.js'],
		dest: '<%= scriptFolder %>',
		ext: '.min.js'
      }
    },
	cssmin: {
		minify: {
		expand: true,
		cwd: '<%= cssFolder %>',
		src: ['**/*.css', '!**/*.min.css'],
		dest: '<%= cssFolder %>',
		ext: '.min.css'
	  }
	},
	imagemin: {
            build: {
                options: {
                    optimizationLevel: 3 
                },
                files: [
                    {
                    expand: true,
                    cwd: '<%= imgFolder %>',
                    src: ['**/*.{png,jpg,jpeg}'], 
                    dest: '<%= imgFolder %>' 
                    }
                    ]
                }
    }
	
  }); // The end of grunt.initConfig

  // We've set up each task's configuration.
  // Now actually load the tasks.
  // This will do a lookup similar to node's require() function.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  // Register our own custom task alias.
   grunt.registerTask('default', ['clean','uglify','cssmin','imagemin']);
};