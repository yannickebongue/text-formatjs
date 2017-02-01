module.exports = function( grunt ) {

    "use strict";

    var coreFiles = [
        "resource-bundle.js",
        "locale.js",
        "currency-data.js",
        "currency.js",
        "field-position.js",
        "parse-position.js",
        "format.js"
    ];

    var numberFormatFiles = [
        "number-format.js",
        "digit-list.js",
        "decimal-format-symbols.js",
        "decimal-format.js",
        "choice-format.js"
    ];

    var dateFormatFiles = [
        "calendar-helper.js",
        "date-format-symbols.js",
        "date-format.js",
        "simple-date-format.js"
    ];

    var messageFormatFiles = [
        "message-format.js"
    ];

    var sourceFiles = coreFiles
        .concat( numberFormatFiles )
        .concat( dateFormatFiles )
        .concat( messageFormatFiles )
        .map( function( file ) {
        return "src/" + file;
    } );

    grunt.initConfig( {

        pkg: grunt.file.readJSON( "package.json" ),

        clean: {
            dist: "dist/",
            lib: "lib/"
        },

        copy: {
            main: {
                expand: true,
                cwd: "src/",
                src: "**",
                dest: "lib/"
            }
        },

        npmcopy: {
            external: {
                options: {
                    destPrefix: "external/"
                },
                files: {
                    "text-resources": "text-resources/dist/**/*.js"
                }
            }
        },

        uglify: {
            options: {
                mangle: {
                    except: [
                        "CalendarHelper",
                        "ChoiceFormat",
                        "Currency",
                        "DateFormat",
                        "DateFormatSymbols",
                        "DecimalFormat",
                        "DecimalFormatSymbols",
                        "DigitList",
                        "FieldPosition",
                        "ParsePosition",
                        "Format",
                        "Locale",
                        "MessageFormat",
                        "NumberFormat",
                        "ResourceBundle",
                        "SimpleDateFormat"
                    ]
                },
                ASCIIOnly: true,
                banner: "/*! <%=pkg.name %> | <%= pkg.version %> | <%= grunt.template.today('yyyy-mm-dd') %> */\n"
            },
            main: {
                options: {
                    mangle: false,
                    compress: false,
                    beautify: true,
                    preserveComments: "all"
                },
                files: {
                    "dist/text-format.js": sourceFiles
                }
            },
            dist: {
                options: {
                    sourceMap: true
                },
                files: {
                    "dist/text-format.min.js": "dist/text-format.js"
                }
            }
        },

        qunit: {
            all: [ "test/unit/*/**/*.html" ]
        }

    } );

    grunt.loadNpmTasks( "grunt-contrib-clean" );
    grunt.loadNpmTasks( "grunt-contrib-copy" );
    grunt.loadNpmTasks( "grunt-contrib-uglify" );
    grunt.loadNpmTasks( "grunt-contrib-qunit" );
    grunt.loadNpmTasks( "grunt-npmcopy" );

    grunt.registerTask( "default", [ "clean", "copy", "uglify:main", "uglify:dist" ] );
    grunt.registerTask( "test", [ "qunit" ] );

};