( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.require( "./resource-bundle" );
        module.require( "./locale" );
        module.require( "./currency" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    function DecimalFormatSymbols( locale ) {
        var _zeroDigit = null;
        var _groupingSeparator = null;
        var _decimalSeparator = null;
        var _perMill = null;
        var _percent = null;
        var _digit = null;
        var _patternSeparator = null;
        var _infinity = null;
        var _NaN = null;
        var _minusSign = null;
        var _currencySymbol = null;
        var _intlCurrencySymbol = null;
        var _monetarySeparator = null;
        var _exponential = null;
        var _exponentialSeparator = null;
        var _locale = null;
        var _currency = null;

        var _initialize = function( locale ) {
            var rb = global.ResourceBundle.getBundle( "FormatData", locale );
            var numberElements = rb[ "NumberElements" ];

            _decimalSeparator = numberElements[ 0 ];
            _groupingSeparator = numberElements[ 1 ];
            _patternSeparator = numberElements[ 2 ];
            _percent = numberElements[ 3 ];
            _zeroDigit = numberElements[ 4 ];
            _digit = numberElements[ 5 ];
            _minusSign = numberElements[ 6 ];
            _exponential = numberElements[ 7 ];
            _exponentialSeparator = numberElements[ 7 ];
            _perMill = numberElements[ 8 ];
            _infinity = numberElements[ 9 ];
            _NaN = numberElements[ 10 ];

            if ( locale.getCountry().length > 0 ) {
                _currency = global.Currency.getInstance( locale );
            }
            if ( _currency != null ) {
                _intlCurrencySymbol = _currency.getCurrencyCode();
                _currencySymbol = _currency.getSymbol( locale );
            } else {
                _intlCurrencySymbol = "XXX";
                _currency = global.Currency.getInstance( _intlCurrencySymbol );
                _currencySymbol = "\u00A4";
            }

            _locale = locale;
            _monetarySeparator = _decimalSeparator;
        };

        this.getZeroDigit = function() {
            return _zeroDigit;
        };

        this.setZeroDigit = function( zeroDigit ) {
            _zeroDigit = zeroDigit;
        };

        this.getGroupingSeparator = function() {
            return _groupingSeparator;
        };

        this.setGroupingSeparator = function( groupingSeparator ) {
            _groupingSeparator = groupingSeparator;
        };

        this.getDecimalSeparator = function() {
            return _decimalSeparator;
        };

        this.setDecimalSeparator = function( decimalSeparator ) {
            _decimalSeparator = decimalSeparator;
        };

        this.getPerMill = function() {
            return _perMill;
        };

        this.setPerMill = function( perMill ) {
            _perMill = perMill;
        };

        this.getPercent = function() {
            return _percent;
        };

        this.setPercent = function( percent ) {
            _percent = percent;
        };

        this.getDigit = function() {
            return _digit;
        };

        this.setDigit = function( digit ) {
            _digit = digit;
        };

        this.getPatternSeparator = function() {
            return _patternSeparator;
        };

        this.setPatternSeparator = function( patternSeparator ) {
            _patternSeparator = patternSeparator;
        };

        this.getInfinity = function() {
            return _infinity;
        };

        this.setInfinity = function( infinity ) {
            _infinity = infinity;
        };

        this.getNaN = function() {
            return _NaN;
        };

        this.setNaN = function( NaN ) {
            _NaN = NaN;
        };

        this.getMinusSign = function() {
            return _minusSign;
        };

        this.setMinusSign = function( minusSign ) {
            _minusSign = minusSign;
        };

        this.getCurrencySymbol = function() {
            return _currencySymbol;
        };

        this.setCurrencySymbol = function( currency ) {
            _currencySymbol = currency;
        };

        this.getInternationalCurrencySymbol = function() {
            return _intlCurrencySymbol;
        };

        this.setInternationalCurrencySymbol = function( currencyCode ) {
            _intlCurrencySymbol = currencyCode;
            _currency = null;
            if ( currencyCode ) {
                _currency = global.Currency.getInstance( currencyCode );
            }
        };

        this.getCurrency = function() {
            return _currency;
        };

        this.setCurrency = function( currency ) {
            if ( currency ) {
                _currency = currency;
                _intlCurrencySymbol = currency.getCurrencyCode();
                _currencySymbol = currency.getSymbol( _locale );
            }
        };

        this.getMonetaryDecimalSeparator = function() {
            return _monetarySeparator;
        };

        this.setMonetaryDecimalSeparator = function( separator ) {
            _monetarySeparator = separator;
        };

        this.getExponentialSymbol = function() {
            return _exponential;
        };

        this.setExponentialSymbol = function( exponential ) {
            _exponential = exponential;
        };

        this.getExponentSeparator = function() {
            return _exponentialSeparator;
        };

        this.setExponentSeparator = function( separator ) {
            _exponentialSeparator = separator;
        };

        _initialize( locale || global.Locale.getDefault() );
    }

    global.DecimalFormatSymbols = DecimalFormatSymbols;

    return DecimalFormatSymbols;

} ) );
