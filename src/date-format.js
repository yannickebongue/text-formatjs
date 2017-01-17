( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.require( "locale" );
        module.require( "format" );
        module.require( "simple-date-format" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    function DateFormat() {
        global.Format.call( this );
    }

    var _get = function( timeStyle, dateStyle, flags, loc ) {
        if ((flags & 1) != 0) {
            if (timeStyle < 0 || timeStyle > 3) {
                throw "Illegal time style " + timeStyle;
            }
        } else {
            timeStyle = -1;
        }
        if ((flags & 2) != 0) {
            if (dateStyle < 0 || dateStyle > 3) {
                throw "Illegal date style " + dateStyle;
            }
        } else {
            dateStyle = -1;
        }
        try {
            return new global.SimpleDateFormat(timeStyle, dateStyle, loc);
        } catch ( e ) {
            return new global.SimpleDateFormat("M/d/yy h:mm a");
        }
    };

    DateFormat.ERA_FIELD = 0;
    DateFormat.YEAR_FIELD = 1;
    DateFormat.MONTH_FIELD = 2;
    DateFormat.DATE_FIELD = 3;
    DateFormat.HOUR_OF_DAY1_FIELD = 4;
    DateFormat.HOUR_OF_DAY0_FIELD = 5;
    DateFormat.MINUTE_FIELD = 6;
    DateFormat.SECOND_FIELD = 7;
    DateFormat.MILLISECOND_FIELD = 8;
    DateFormat.DAY_OF_WEEK_FIELD = 9;
    DateFormat.DAY_OF_YEAR_FIELD = 10;
    DateFormat.DAY_OF_WEEK_IN_MONTH_FIELD = 11;
    DateFormat.WEEK_OF_YEAR_FIELD = 12;
    DateFormat.WEEK_OF_MONTH_FIELD = 13;
    DateFormat.AM_PM_FIELD = 14;
    DateFormat.HOUR1_FIELD = 15;
    DateFormat.HOUR0_FIELD = 16;
    DateFormat.TIMEZONE_FIELD = 17;

    DateFormat.FULL = 0;
    DateFormat.LONG = 1;
    DateFormat.MEDIUM = 2;
    DateFormat.SHORT = 3;
    DateFormat.DEFAULT = DateFormat.MEDIUM;

    DateFormat.getTimeInstance = function( style, locale ) {
        return _get( ( typeof style != "undefined" ? style : DateFormat.DEFAULT ), 0,
            1, locale || global.Locale.getDefault() );
    };

    DateFormat.getDateInstance = function( style, locale ) {
        return _get( 0, ( typeof style != "undefined" ? style : DateFormat.DEFAULT ),
            2, locale || global.Locale.getDefault() );
    };

    DateFormat.getDateTimeInstance = function( dateStyle, timeStyle, locale ) {
        return _get( ( typeof timeStyle != "undefined" ? timeStyle : DateFormat.DEFAULT ),
            ( typeof dateStyle != "undefined" ? dateStyle : DateFormat.DEFAULT ),
            3, locale || global.Locale.getDefault() );
    };

    DateFormat.getInstance = function() {
        return DateFormat.getDateTimeInstance( DateFormat.SHORT, DateFormat.SHORT );
    };

    DateFormat.prototype = Object.create( global.Format.prototype );

    DateFormat.prototype.constructor = DateFormat;

    DateFormat.Field = function Field( name ) {
        global.Format.Field.call( this, name );
    };

    DateFormat.Field.ERA = new DateFormat.Field( "era" );
    DateFormat.Field.YEAR = new DateFormat.Field( "year" );
    DateFormat.Field.MONTH = new DateFormat.Field( "month" );
    DateFormat.Field.DAY_OF_MONTH = new DateFormat.Field( "day of month" );
    DateFormat.Field.HOUR_OF_DAY1 = new DateFormat.Field( "hour of day 1" );
    DateFormat.Field.HOUR_OF_DAY0 = new DateFormat.Field( "hour of day" );
    DateFormat.Field.MINUTE = new DateFormat.Field( "minute" );
    DateFormat.Field.SECOND = new DateFormat.Field( "second" );
    DateFormat.Field.MILLISECOND = new DateFormat.Field( "millisecond" );
    DateFormat.Field.DAY_OF_WEEK = new DateFormat.Field( "day of week" );
    DateFormat.Field.DAY_OF_YEAR = new DateFormat.Field( "day of year" );
    DateFormat.Field.DAY_OF_WEEK_IN_MONTH = new DateFormat.Field( "day of week in month" );
    DateFormat.Field.WEEK_OF_YEAR = new DateFormat.Field( "week of year" );
    DateFormat.Field.WEEK_OF_MONTH = new DateFormat.Field( "week of month" );
    DateFormat.Field.AM_PM = new DateFormat.Field( "am pm" );
    DateFormat.Field.HOUR1 = new DateFormat.Field( "hour 1" );
    DateFormat.Field.HOUR0 = new DateFormat.Field( "hour" );
    DateFormat.Field.TIME_ZONE = new DateFormat.Field( "time zone" );

    DateFormat.Field.prototype = Object.create( global.Format.Field.prototype );

    DateFormat.Field.prototype.constructor = DateFormat.Field;

    global.DateFormat = DateFormat;

    return DateFormat;

} ) );