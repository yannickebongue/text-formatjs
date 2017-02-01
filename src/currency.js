( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        global.CurrencyData = module.require( "./currency-data" );
        exports.Currency = module.exports = factory( global );
    } else {
        factory( global );
    }

} )( this, function( global ) {
    var CurrencyData = global.CurrencyData;

    function Currency( currencyCode, defaultFractionDigits, numericCode ) {
        var _currencyCode = currencyCode;
        var _defaultFractionDigits = defaultFractionDigits;
        var _numericCode = numericCode;

        this.getCurrencyCode = function() {
            return _currencyCode;
        };

        this.getDefaultFractionDigits = function() {
            return _defaultFractionDigits;
        };

        this.getNumericCode = function() {
            return _numericCode;
        };

        this.getSymbol = function( locale ) {
            var bundle = ResourceBundle.getBundle( "CurrencyNames", locale );
            return bundle[ _currencyCode ];
        };

        this.getDisplayName = function( locale ) {
            var bundle = ResourceBundle.getBundle( "CurrencyNames", locale );
            return bundle[ _currencyCode.toLowerCase() ];
        };
    }

    var instances = {};

    Currency.getInstance = function( arg ) {
        if ( typeof arg == "string" ) {
            var currencyCode = arg.length > 0 ? arg : "XXX" ;
            var instance = instances[ currencyCode ];
            if ( !instance ) {
                var data = CurrencyData;
                var numericCode = 0;
                var defaultFractionDigit = -1;
                var result = new RegExp( currencyCode + "\\d{3}" ).exec( data["all"] ).toString();
                if ( result && result.length > 0 ) {
                    var regex = new RegExp( currencyCode );
                    numericCode = result.substring( 3 );
                    defaultFractionDigit = 2;
                    if ( regex.test( data[ "minor0" ] ) ) {
                        defaultFractionDigit = 0;
                    }
                    if ( regex.test( data[ "minor1" ] ) ) {
                        defaultFractionDigit = 1;
                    }
                    if ( regex.test( data[ "minor3" ] ) ) {
                        defaultFractionDigit = 3;
                    }
                    if ( regex.test( data[ "minorUndefined" ] ) ) {
                        defaultFractionDigit = -1;
                    }
                }
                instance = new Currency( currencyCode, defaultFractionDigit, numericCode );
                if ( defaultFractionDigit != -1 ) {
                    instances[ currencyCode ] = instance;
                }
            }
            return instance;
        } else if ( arg instanceof Locale ) {
            var locale = arg;
            var countryCode = locale.getCountry();
            if ( countryCode && countryCode.length > 0 ) {
                return Currency.getInstance( CurrencyData[ countryCode ] );
            } else {
                return new Currency( "XXX", -1, 0 );
            }
        } else {
            return null;
        }
    };

    Currency.prototype.toString = function() {
        return this.getCurrencyCode();
    };

    global.Currency = Currency;

    return Currency;

} );
