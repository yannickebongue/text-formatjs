( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    function ResourceBundle() {
    }

    ResourceBundle.getBundle = function( baseName ) {
        var locale = arguments.length > 1 && arguments[1] ? arguments[1] : global.Locale.getDefault();
        var bundle = _cache[ baseName + "-" + locale.toLanguageTag() ];
        if ( bundle ) {
            return bundle;
        }
        if ( global[ baseName ] ) {
            if ( global[ baseName ][ "" ] ) {
                var language = locale.getLanguage();
                var country = locale.getCountry();
                var variant = locale.getVariant();
                var key;
                bundle = global[ baseName ][ "" ];
                if ( language && language.length > 0 ) {
                    var code = language;
                    if ( global[ baseName ][ code ] ) {
                        for ( key in global[ baseName ][ code ] ) {
                            bundle[ key ] = global[ baseName ][ code ][ key ];
                        }
                    }
                    if ( country && country.length > 0 ) {
                        code += "-" + country;
                        if ( global[ baseName ][ code ] ) {
                            for ( key in global[ baseName ][ code ] ) {
                                bundle[ key ] = global[ baseName ][ code ][ key ];
                            }
                        }
                        if ( variant && variant.length > 0 ) {
                            code += "-" + variant;
                            if ( global[ baseName ][ code ] ) {
                                for ( key in global[ baseName ][ code ] ) {
                                    bundle[ key ] = global[ baseName ][ code ][ key ];
                                }
                            }
                        }
                    }
                }
                _cache[ baseName + "-" + locale.toLanguageTag() ] = bundle;
                return bundle;
            } else {
                return {};
            }
        } else {
            return null;
        }
    };

    var _cache = {};

    global.ResourceBundle = ResourceBundle;

    return ResourceBundle;

} ) );
