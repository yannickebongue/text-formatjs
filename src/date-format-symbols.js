( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.require( "../resources/format-data" );
        module.require( "./resource-bundle" );
        module.require( "./locale" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    function DateFormatSymbols( locale ) {
        var _eras = null;
        var _months = null;
        var _shortMonths = null;
        var _weekdays = null;
        var _shortWeekdays = null;
        var _ampms = null;
        var _zoneStrings = null;
        var _localPatternChars = null;
        var _locale = null;

        var _initializeData = function( desiredLocale ) {
            _locale = desiredLocale;

            // Initialize the fields from the ResourceBundle for locale.
            var resource = global.ResourceBundle.getBundle( "FormatData", desiredLocale );

            _eras = resource[ "Eras" ];
            _months = resource[ "MonthNames" ];
            _shortMonths = resource[ "MonthAbbreviations" ];
            _ampms = resource[ "AmPmMarkers" ];
            _localPatternChars = resource[ "DateTimePatternChars" ];

            // Day of week names are stored in a 1-based array.
            _weekdays = _toOneBasedArray( resource[ "DayNames" ] );
            _shortWeekdays = _toOneBasedArray( resource[ "DayAbbreviations" ] );
        };

        this.getEras = function() {
            return _eras.slice();
        };

        this.setEras = function( newEras ) {
            _eras = newEras.slice();
        };

        this.getMonths = function() {
            return _months.slice();
        };

        this.setMonths = function( newMonths ) {
            _months = newMonths.slice();
        };

        this.getShortMonths = function() {
            return _shortMonths.slice();
        };

        this.setShortMonths = function( newShortMonths ) {
            _shortMonths = newShortMonths.slice();
        };

        this.getWeekdays = function() {
            return _weekdays.slice();
        };

        this.setWeekdays = function( newWeekdays ) {
            _weekdays = newWeekdays.slice();
        };

        this.getShortWeekdays = function() {
            return _shortWeekdays.slice();
        };

        this.setShortWeekdays = function( newShortWeekdays ) {
            _shortWeekdays = newShortWeekdays.slice();
        };

        this.getAmPmStrings = function() {
            return _ampms.slice();
        };

        this.setAmPmStrings = function( newAmpms ) {
            _ampms = newAmpms.slice();
        };

        // TODO: Load zone strings if not initialized
        this.getZoneStrings = function() {
            var arr = [];
            for ( var i = 0; i < _zoneStrings.length; i++ ) {
                arr.push( _zoneStrings[ i ].slice() );
            }
            return arr;
        };

        this.setZoneStrings = function( newZoneStrings ) {
            var arr = [];
            for ( var i = 0; i < newZoneStrings.length; i++ ) {
                arr.push( newZoneStrings[ i ].slice() );
            }
            _zoneStrings = arr;
        };

        this.getLocalPatternChars = function() {
            return _localPatternChars.toString();
        };

        this.setLocalPatternChars = function( newLocalPatternChars ) {
            _localPatternChars = newLocalPatternChars.toString();
        };

        _initializeData( locale || global.Locale.getDefault() );
    }

    var _toOneBasedArray = function( src ) {
        var dst = src.slice();
        dst.unshift( "" );
        return dst;
    };

    DateFormatSymbols.patternChars = "GyMdkHmsSEDFwWahKzZYuX";

    DateFormatSymbols.PATTERN_ERA                  =  0; // G
    DateFormatSymbols.PATTERN_YEAR                 =  1; // y
    DateFormatSymbols.PATTERN_MONTH                =  2; // M
    DateFormatSymbols.PATTERN_DAY_OF_MONTH         =  3; // d
    DateFormatSymbols.PATTERN_HOUR_OF_DAY1         =  4; // k
    DateFormatSymbols.PATTERN_HOUR_OF_DAY0         =  5; // H
    DateFormatSymbols.PATTERN_MINUTE               =  6; // m
    DateFormatSymbols.PATTERN_SECOND               =  7; // s
    DateFormatSymbols.PATTERN_MILLISECOND          =  8; // S
    DateFormatSymbols.PATTERN_DAY_OF_WEEK          =  9; // E
    DateFormatSymbols.PATTERN_DAY_OF_YEAR          = 10; // D
    DateFormatSymbols.PATTERN_DAY_OF_WEEK_IN_MONTH = 11; // F
    DateFormatSymbols.PATTERN_WEEK_OF_YEAR         = 12; // w
    DateFormatSymbols.PATTERN_WEEK_OF_MONTH        = 13; // W
    DateFormatSymbols.PATTERN_AM_PM                = 14; // a
    DateFormatSymbols.PATTERN_HOUR1                = 15; // h
    DateFormatSymbols.PATTERN_HOUR0                = 16; // K
    DateFormatSymbols.PATTERN_ZONE_NAME            = 17; // z
    DateFormatSymbols.PATTERN_ZONE_VALUE           = 18; // Z
    DateFormatSymbols.PATTERN_WEEK_YEAR            = 19; // Y
    DateFormatSymbols.PATTERN_ISO_DAY_OF_WEEK      = 20; // u
    DateFormatSymbols.PATTERN_ISO_ZONE             = 21; // X

    global.DateFormatSymbols = DateFormatSymbols;

    return DateFormatSymbols;

} ) );
