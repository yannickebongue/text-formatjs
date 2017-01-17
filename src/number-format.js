( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.require( "../resources/format-data" );
        module.require( "./resource-bundle" );
        module.require( "./format" );
        module.require( "./decimal-format-symbols" );
        module.require( "./decimal-format" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    function NumberFormat() {
        global.Format.call( this );

        var _groupingUsed = true;
        var _maximumIntegerDigits = 40;
        var _minimumIntegerDigits = 1;
        var _maximumFractionDigits = 3;
        var _minimumFractionDigits = 0;
        var _parseIntegerOnly = false;

        this.isGroupingUsed = function() {
            return _groupingUsed;
        };

        this.setGroupingUsed = function( value ) {
            _groupingUsed = value;
        };

        this.getMaximumIntegerDigits = function() {
            return _maximumIntegerDigits;
        };

        this.setMaximumIntegerDigits = function( value ) {
            _maximumIntegerDigits = Math.max( 0, value );
            _minimumIntegerDigits = Math.min( _minimumIntegerDigits, _maximumIntegerDigits );
        };

        this.getMinimumIntegerDigits = function() {
            return _minimumIntegerDigits;
        };

        this.setMinimumIntegerDigits = function( value ) {
            _minimumIntegerDigits = Math.max( 0, value );
            _maximumIntegerDigits = Math.max( _minimumIntegerDigits, _maximumIntegerDigits );
        };

        this.getMaximumFractionDigits = function() {
            return _maximumFractionDigits;
        };

        this.setMaximumFractionDigits = function( value ) {
            _maximumFractionDigits = Math.max( 0, value );
            _minimumFractionDigits = Math.min( _minimumFractionDigits, _maximumFractionDigits );
        };

        this.getMinimumFractionDigits = function() {
            return _minimumFractionDigits;
        };

        this.setMinimumFractionDigits = function( value ) {
            _minimumFractionDigits = Math.max( 0, value );
            _maximumFractionDigits = Math.max( _minimumFractionDigits, _maximumFractionDigits );
        };

        this.isParseIntegerOnly = function() {
            return _parseIntegerOnly;
        };

        this.setParseIntegerOnly = function( value) {
            _parseIntegerOnly = value;
        };

    }

    // Constants used by factory methods to specify a style of format.
    var _NUMBERSTYLE = 0;
    var _CURRENCYSTYLE = 1;
    var _PERCENTSTYLE = 2;
    var _SCIENTIFICSTYLE = 3;
    var _INTEGERSTYLE = 4;

    var _getInstance = function( desiredLocale, choice ) {
        var resource = global.ResourceBundle.getBundle( "FormatData", desiredLocale );
        var numberPatterns = resource[ "NumberPatterns" ];

        var symbols = new global.DecimalFormatSymbols( desiredLocale );
        var entry = ( choice == _INTEGERSTYLE ) ? _NUMBERSTYLE : choice;
        var format = new global.DecimalFormat( numberPatterns[ entry ], symbols );

        if ( choice == _INTEGERSTYLE ) {
            format.setMaximumFractionDigits( 0 );
            format.setDecimalSeparatorAlwaysShown( false );
            format.setParseIntegerOnly( true );
        } else if ( choice == _CURRENCYSTYLE ) {
            format.adjustForCurrencyDefaultFractionDigits();
        }

        return format;
    };

    NumberFormat.INTEGER_FIELD = 0;
    NumberFormat.FRACTION_FIELD = 1;

    NumberFormat.getInstance = function( inLocale ) {
        return _getInstance( inLocale || global.Locale.getDefault(), _NUMBERSTYLE );
    };

    NumberFormat.getNumberInstance = function( inLocale ) {
        return _getInstance( inLocale || global.Locale.getDefault(), _NUMBERSTYLE );
    };

    NumberFormat.getIntegerInstance = function( inLocale ) {
        return _getInstance( inLocale || global.Locale.getDefault(), _INTEGERSTYLE );
    };

    NumberFormat.getCurrencyInstance = function( inLocale ) {
        return _getInstance( inLocale || global.Locale.getDefault(), _CURRENCYSTYLE );
    };

    NumberFormat.getPercentInstance = function( inLocale ) {
        return _getInstance( inLocale || global.Locale.getDefault(), _PERCENTSTYLE );
    };

    NumberFormat.prototype = Object.create( global.Format.prototype );

    NumberFormat.prototype.constructor = NumberFormat;

    NumberFormat.Field = function Field( name ) {
        global.Format.Field.call( this, name );
    };

    NumberFormat.Field.prototype = Object.create( global.Format.Field.prototype );

    NumberFormat.Field.prototype.constructor = NumberFormat.Field;

    NumberFormat.Field.INTEGER = new NumberFormat.Field( "integer" );
    NumberFormat.Field.FRACTION = new NumberFormat.Field( "fraction" );
    NumberFormat.Field.EXPONENT = new NumberFormat.Field( "exponent" );
    NumberFormat.Field.DECIMAL_SEPARATOR = new NumberFormat.Field( "decimal separator" );
    NumberFormat.Field.SIGN = new NumberFormat.Field( "sign" );
    NumberFormat.Field.GROUPING_SEPARATOR = new NumberFormat.Field( "grouping separator" );
    NumberFormat.Field.EXPONENT_SYMBOL = new NumberFormat.Field( "exponent symbol" );
    NumberFormat.Field.PERCENT = new NumberFormat.Field( "percent" );
    NumberFormat.Field.PERMILLE = new NumberFormat.Field( "per mille" );
    NumberFormat.Field.CURRENCY = new NumberFormat.Field( "currency" );
    NumberFormat.Field.EXPONENT_SIGN = new NumberFormat.Field( "exponent sign" );

    global.NumberFormat = NumberFormat;

    return NumberFormat;

} ) );
