module.exports = function(grunt) {

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-typescript");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-mocha-test");

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        clean: {
            build: {
                src: [
                    "build/"
                ]
            }
        },

        typescript: {
            build: {
                options: {
                    target: "es5",
                    module: "commonjs",
                    sourceMap: true,
                    declaration: false,
                    noImplicitAny: true
                },
                src: ['src/**/*.ts'],
                dest: 'build/'
            },
            tests: {
                options: {
                    target: "es5",
                    module: "commonjs",
                    sourceMap: true,
                    noImplicitAny: true
                },
                src: [
                    'tests/**/*.ts'
                ],
                dest: 'build/'
            }
        },

        mochaTest: {
            tests: {
                options: {
                    reporter: 'spec'
                },
                src: ['build/tests/**/*.tests.js']
            }
        }
    });

    // Default task(s).
    grunt.registerTask("default", [ "build", "tests" ]);
    grunt.registerTask("build", [ "clean:build", "typescript:build" ]);
    grunt.registerTask("tests", [ "typescript:tests", "mochaTest:tests" ]);
};