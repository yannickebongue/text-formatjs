( function() {
    var global = this;

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

        var _getDisplayVariantArray = function( bundle, inLocale ) {
            if ( _variant.length == 0 ) {
                return [];
            }
            // Split the variant name into tokens separated by '_'.
            var variants = _variant.split( "_" );

            // For each variant token, lookup the display name.  If
            // not found, use the variant name itself.
            var names = variants.map( function( variant ) {
                return _getDisplayString( variant, inLocale, _DISPLAY_VARIANT );
            } );

            return names;
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
            if ( _variant.length == 0 ) {
                return "";
            }

            var bundle = global.ResourceBundle.getBundle( "LocaleNames", inLocale );

            var names = _getDisplayVariantArray( bundle, inLocale );

            // Get the localized patterns for formatting a list, and use
            // them to format the list.
            var listPattern = null;
            var listCompositionPattern = null;
            try {
                listPattern = bundle[ "ListPattern" ];
                listCompositionPattern = bundle[ "ListCompositionPattern" ];
            } catch ( e ) {
            }
            return _formatList( names, listPattern, listCompositionPattern );
        };

        this.getDisplayName = function( inLocale ) {
            var bundle = global.ResourceBundle.getBundle( "LocaleNames", inLocale );

            var languageName = this.getDisplayLanguage(inLocale);
            // var scriptName = this.getDisplayScript(inLocale);
            var countryName = this.getDisplayCountry(inLocale);
            var variantNames = _getDisplayVariantArray(bundle, inLocale);

            // Get the localized patterns for formatting a display name.
            var displayNamePattern = null;
            var listPattern = null;
            var listCompositionPattern = null;
            try {
                displayNamePattern = bundle["DisplayNamePattern"];
                listPattern = bundle["ListPattern"];
                listCompositionPattern = bundle["ListCompositionPattern"];
            } catch (e) {
            }

            // The display name consists of a main name, followed by qualifiers.
            // Typically, the format is "MainName (Qualifier, Qualifier)" but this
            // depends on what pattern is stored in the display locale.
            var mainName;
            var qualifierNames;

            // The main name is the language, or if there is no language, the script,
            // then if no script, the country. If there is no language/script/country
            // (an anomalous situation) then the display name is simply the variant's
            // display name.
            if (languageName.length == 0 && countryName.length == 0) {
                if (variantNames.length == 0) {
                     return "";
                 } else {
                     return _formatList(variantNames, listPattern, listCompositionPattern);
                 }
            }
            var names = [];
            if (languageName.length != 0) {
                names.push(languageName);
            }
            if (countryName.length != 0) {
                names.push(countryName);
            }
            if (variantNames.length != 0) {
                 variantNames.forEach(function(variantName) {
                     names.push(variantName);
                 });
             }

            // The first one in the main name
            mainName = names[0];

            // Others are qualifiers
            var numNames = names.length;
            qualifierNames = (numNames > 1) ?
                names.slice(1, numNames) : new Array(0);

            // Create an array whose first element is the number of remaining
            // elements.  This serves as a selector into a ChoiceFormat pattern from
            // the resource.  The second and third elements are the main name and
            // the qualifier; if there are no qualifiers, the third element is
            // unused by the format pattern.
            var displayNames = [
                qualifierNames.length != 0 ? 2 : 1,
                mainName,
                // We could also just call formatList() and have it handle the empty
                // list case, but this is more efficient, and we want it to be
                // efficient since all the language-only locales will not have any
                // qualifiers.
                qualifierNames.length != 0 ? _formatList(qualifierNames, listPattern, listCompositionPattern) : null
            ];

            if (displayNamePattern != null) {
                return new MessageFormat(displayNamePattern).format(displayNames);
            }
            else {
                // If we cannot get the message format pattern, then we use a simple
                // hard-coded pattern.  This should not occur in practice unless the
                // installation is missing some core files (FormatData etc.).
                var result = "";
                result += displayNames[1];
                if (displayNames.length > 2) {
                    result += " (";
                    result += displayNames[2];
                    result += ')';
                }
                return result;
            }
        };

    }

    var _CACHE = {};
    var _defaultLocale;

    var _initDefault = function() {
        var browserLanguageParts = global.navigator ? global.navigator.language.split( "-" ) : [ "en", "US" ];
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

    var _formatList = function( stringList, listPattern, listCompositionPattern ) {
        // If we have no list patterns, compose the list in a simple,
        // non-localized way.
        var format;
        var i;
        if (listPattern == null || listCompositionPattern == null) {
            var result = "";
            for (i = 0; i < stringList.length; ++i) {
                if (i > 0) result += ',';
                result += stringList[i];
            }
            return result;
        }

        // Compose the list down to three elements if necessary
        if (stringList.length > 3) {
            format = new MessageFormat(listCompositionPattern);
            stringList = _composeList(format, stringList);
        }

        // Rebuild the argument list with the list length as the first element
        var args = new Array(stringList.length + 1);
        for (i = 0; i < stringList.length; i++) {
            args[i + 1] = stringList[i];
        }
        args[0] = stringList.length;

        // Format it using the pattern in the resource
        format = new MessageFormat(listPattern);
        return format.format(args);
    };

    var _composeList = function( format, list ) {
        if (list.length <= 3) return list;

        // Use the given format to compose the first two elements into one
        var listItems = [ list[0], list[1] ];
        var newItem = format.format(listItems);

        // Form a new list one element shorter
        var newList = new Array(list.length - 1);
        for (var i = 2; i < newList.length - 1; i++) {
            newList[i - 1] = list[i];
        }
        newList[0] = newItem;

        // Recurse
        return _composeList(format, newList);
    };

    Locale.getDefault = function() {
        if ( !_defaultLocale ) {
            _initDefault();
        }
        return _defaultLocale;
    };

    Locale.setDefault = function( newLocale ) {
        _defaultLocale = newLocale;
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

    Locale.prototype.toString = function() {
        return this.toLanguageTag();
    };

    global.Locale = Locale;

    return Locale;

} )();
