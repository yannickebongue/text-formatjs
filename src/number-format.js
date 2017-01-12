( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.require( "./format" );
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

    NumberFormat.INTEGER_FIELD = 0;
    NumberFormat.FRACTION_FIELD = 1;

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
