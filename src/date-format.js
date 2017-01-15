( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.require( "locale" );
        module.require( "format" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    function DateFormat() {
        global.Format.call( this );
    }

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

    DateFormat.prototype = Object.create( global.Format.prototype );

    DateFormat.prototype.constructor = DateFormat;

    DateFormat.Field = function Field( name ) {
        global.Format.Field.call( this, name );
    };

    DateFormat.Field.ERA = new Field( "era" );
    DateFormat.Field.YEAR = new Field( "year" );
    DateFormat.Field.MONTH = new Field( "month" );
    DateFormat.Field.DAY_OF_MONTH = new Field( "day of month" );
    DateFormat.Field.HOUR_OF_DAY1 = new Field( "hour of day 1" );
    DateFormat.Field.HOUR_OF_DAY0 = new Field( "hour of day" );
    DateFormat.Field.MINUTE = new Field( "minute" );
    DateFormat.Field.SECOND = new Field( "second" );
    DateFormat.Field.MILLISECOND = new Field( "millisecond" );
    DateFormat.Field.DAY_OF_WEEK = new Field( "day of week" );
    DateFormat.Field.DAY_OF_YEAR = new Field( "day of year" );
    DateFormat.Field.DAY_OF_WEEK_IN_MONTH = new Field( "day of week in month" );
    DateFormat.Field.WEEK_OF_YEAR = new Field( "week of year" );
    DateFormat.Field.WEEK_OF_MONTH = new Field( "week of month" );
    DateFormat.Field.AM_PM = new Field( "am pm" );
    DateFormat.Field.HOUR1 = new Field( "hour 1" );
    DateFormat.Field.HOUR0 = new Field( "hour" );
    DateFormat.Field.TIME_ZONE = new Field( "time zone" );

    DateFormat.Field.prototype = Object.create( global.Format.Field.prototype );

    DateFormat.Field.prototype.constructor = Field;

    global.DateFormat = DateFormat;

    return DateFormat;

} ) );