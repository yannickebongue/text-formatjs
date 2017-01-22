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

    var resourceDir = "resources/";
    var resourceNames = [
        "currency-names",
        "format-data",
        "locale-names"
    ];

    var resourceFiles = [];
    resourceNames.forEach( function( baseName ) {
        var pattern = resourceDir + baseName + "-*.js";
        resourceFiles.push( resourceDir + baseName + ".js" );
        resourceFiles = resourceFiles.concat( grunt.file.expandMapping( pattern ).map( function( item ) {
            return item.dest;
        } ) );
    } );

    grunt.initConfig( {

        pkg: grunt.file.readJSON( "package.json" ),

        clean: [ "dist/" ],

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
                sourceMap: true,
                banner: "/*! <%=pkg.name %> | <%= pkg.version %> | <%= grunt.template.today('yyyy-mm-dd') %> */\n"
            },
            js: {
                options: {
                    mangle: false,
                    compress: false,
                    beautify: true,
                    sourceMap: false,
                    preserveComments: "all"
                },
                files: {
                    "dist/text-format.js": sourceFiles,
                    "dist/text-resources.js": resourceFiles
                }
            },
            main: {
                files: {
                    "dist/text-format.min.js": "dist/text-format.js"
                }
            },
            resources: {
                files: {
                    "dist/text-resources.min.js": "dist/text-resources.js"
                }
            }
        },

        qunit: {
            all: [ "test/unit/*/**/*.html" ]
        }

    } );

    grunt.loadNpmTasks( "grunt-contrib-clean" );
    grunt.loadNpmTasks( "grunt-contrib-uglify" );
    grunt.loadNpmTasks( "grunt-contrib-qunit" );

    grunt.registerTask( "default", [ "clean", "uglify:js", "uglify:main", "uglify:resources" ] );
    grunt.registerTask( "test", [ "qunit" ] );

};