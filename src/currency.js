( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.require( "../resources/currency-names" );
        module.require( "./resource-bundle" );
        module.require( "./locale" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

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
            var bundle = global.ResourceBundle.getBundle( "CurrencyNames", locale );
            return bundle[ _currencyCode ];
        };

        this.getDisplayName = function( locale ) {
            var bundle = global.ResourceBundle.getBundle( "CurrencyNames", locale );
            return bundle[ _currencyCode.toLowerCase() ];
        };
    }

    var instances = {
        "EUR": new Currency( "EUR", 2, 0 ),
        "GBP": new Currency( "GBP", 2, 0 ),
        "USD": new Currency( "USD", 2, 0 )
    };

    Currency.getInstance = function( currencyCode ) {
        var instance = instances[ currencyCode ];
        if ( !instance ) {
            instance = new Currency( currencyCode, -1, 0 );
            instances[ currencyCode ] = instance;
        }
        return instance;
    };

    Currency.prototype.toString = function() {
        return this.getCurrencyCode();
    };

    global.Currency = Currency;

    return Currency;

} ) );