module.exports = function(grunt) {

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-typescript");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-mocha-test");
    grunt.loadNpmTasks("grunt-dts-concat");

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        clean: {
            build: {
                src: [
                    "build/"
                ]
            },
            lib: {
                src: [
                    "lib/**/*.js",
                ]
            }
        },

        typescript: {
            build: {
                options: {
                    target: "es5",
                    module: "commonjs",
                    sourceMap: true,
                    declaration: true,
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

        copy: {
            build: {
                files: [
                    {
                        expand: true,
                        src: [
                            'package.json',
                            'typings/**/*.d.ts',
                            'src/**/*.d.ts'
                        ],
                        dest: 'build/'
                    }
                ]
            },
            lib: {
                files: [
                    {
                        expand: true,
                        cwd: 'build/src/',
                        src: [
                            '**/*.js'
                        ],
                        dest: 'lib/'
                    }
                ]
            }
        },

        concat: {
            lib: {
                options: {
                    banner: '#!/usr/bin/env node\n\n'
                },
                src: ['build/src/program.js'],
                dest: 'lib/program.js'
            }
        },

        dts_concat: {
            lib: {
                options: {
                    name: 'baseline-lib',
                    main: 'build/src/baseline.d.ts',
                    outDir: 'lib/'
                }
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
    grunt.registerTask("default", [ "build", "tests", "lib" ]);
    grunt.registerTask("build", [ "clean:build", "typescript:build", "copy:build" ]);
    grunt.registerTask("lib", [ "clean:lib", "copy:lib", "concat:lib" ])
    grunt.registerTask("tests", [ "typescript:tests", "mochaTest:tests" ]);
};