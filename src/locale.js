( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.require( "../resources/locale-names" );
        module.require( "./resource-bundle" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    function Locale( language, country, variant ) {
        var _DISPLAY_LANGUAGE = 0;
        var _DISPLAY_COUNTRY = 1;
        var _DISPLAY_VARIANT = 2;
        // var _DISPLAY_SCRIPT = 3;

        var _language = language ? language.toLowerCase() : "";
        var _country = country ? country.toUpperCase() : "";
        var _variant = variant ? variant.toString() : "";

        var _getDisplayString = function( code, inLocale, type ) {
            if ( code.length == 0 ) {
                return "";
            }

            var bundle = global.ResourceBundle.getBundle( "LocaleNames", inLocale );
            var key = type == _DISPLAY_VARIANT ? "%%" + code : code;
            var result = null;

            if ( !result ) {
                result = bundle[ key ];
            }

            if ( result ) {
                return result;
            }

            return code;
        };

        this.getLanguage = function() {
            return _language;
        };

        this.getCountry = function() {
            return _country;
        };

        this.getVariant = function() {
            return _variant;
        };

        this.toLanguageTag = function() {
            var tag = "";
            if ( _language.length > 0 ) {
                tag = _language;
            }
            if ( _country.length > 0 ) {
                tag += "-" + _country;
            }
            if ( _variant.length ) {
                tag += "-" + _variant;
            }
            return tag;
        };

        this.getDisplayLanguage = function( inLocale ) {
            return _getDisplayString( this.getLanguage(), inLocale, _DISPLAY_LANGUAGE );
        };

        this.getDisplayCountry = function( inLocale ) {
            return _getDisplayString( this.getCountry(), inLocale, _DISPLAY_COUNTRY );
        };

        this.getDisplayVariant = function( inLocale ) {
            return _getDisplayString( this.getVariant(), inLocale, _DISPLAY_VARIANT );
        };

    }

    var _CACHE = {};
    var _defaultLocale;

    var _initDefault = function() {
        var browserLanguageParts = global.navigator ? global.navigator.language.split( "-" ) : "en-US";
        var language = "";
        var country = "";
        if ( browserLanguageParts.length > 0 ) {
            language = browserLanguageParts[ 0 ];
            if ( browserLanguageParts.length > 1 ) {
                country = browserLanguageParts[ 1 ];
            }
        }
        _defaultLocale = _getInstance( language, country );
    };

    var _getInstance = function( language, country, variant ) {
        var parts = [ language ];
        var locale;
        var key;
        if ( country ) {
            parts.push( country );
        }
        if ( variant ) {
            parts.push( variant );
        }
        key = parts.join( "-" );
        locale = _CACHE[ key ];
        if ( locale ) {
            return locale;
        } else {
            locale = new Locale( language, country, variant );
            _CACHE[ key ] = locale;
            return locale;
        }
    };

    Locale.getDefault = function() {
        if ( !_defaultLocale ) {
            _initDefault();
        }
        return _defaultLocale;
    };

    Locale.forLanguageTag = function( tag ) {
        var language;
        var country;
        var variant;
        var index;
        var part = tag;
        index = part.search( "-" );
        if ( index > -1 ) {
            language = part.substring( 0, index );
            part = part.substring( index + 1 );
            index = part.search( "-" );
            if ( index > -1 ) {
                country = part.substring( 0, index );
                variant = part.substring( index + 1 );
            } else {
                country = part;
            }
        } else {
            language = part;
        }
        return new Locale( language, country, variant );
    };

    Locale.prototype.getDisplayName = function() {
        var result = this.getDisplayLanguage();
        if ( this.getDisplayCountry() ) {
            result += "(" + this.getDisplayCountry() + ")";
        }
        return result;
    };

    Locale.prototype.toString = function() {
        return this.toLanguageTag();
    };

    global.Locale = Locale;

    return Locale;

} ) );
