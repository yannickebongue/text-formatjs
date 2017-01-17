( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    function CalendarHelper() {}

    CalendarHelper.getField = function( date, field ) {
        switch ( field ) {
            case 0:     // ERA
                return 1;
            case 1:     // YEAR
                return date.getFullYear();
            case 2:     // MONTH
                return date.getMonth();
            case 3:     // WEEK_OF_YEAR
                return null;
            case 4:     // WEEK_OF_MONTH
                return null;
            case 5:     // DATE, DAY_OF_MONTH
                return date.getDate();
            case 6:     // DAY_OF_YEAR
                return null;
            case 7:     // DAY_OF_WEEK
                return date.getDay() + 1;
            case 8:     // DAY_OF_WEEK_IN_MONTH
                return null;
            case 9:     // AM_PM
                return date.getHours() < 12 ? 0 : 1;
            case 10:    // HOUR
                return date.getHours() - 12;
            case 11:    // HOUR_OF_DAY
                return date.getHours();
            case 12:    // MINUTE
                return date.getMinutes();
            case 13:    // SECOND
                return date.getSeconds();
            case 14:    // MILLISECOND
                return date.getMilliseconds();
            case 15:    // ZONE_OFFSET
                return date.getTimezoneOffset();
            case 16:    // DST_OFFSET
                return 0;
            default:
                return null;
        }
    };

    CalendarHelper.toISODayOfWeek = function( calendarDayOfWeek ) {
        return calendarDayOfWeek == 1 ? 7 : calendarDayOfWeek - 1;
    };

    CalendarHelper.toCalendarDayOfWeek = function( isoDayOfWeek ) {
        if ( !CalendarHelper.isValidDayOfWeek( isoDayOfWeek ) ) {
            // adjust later for lenient mode
            return isoDayOfWeek;
        }
        return isoDayOfWeek == 7 ? 1 : isoDayOfWeek + 1;
    };

    CalendarHelper.isValidDayOfWeek = function( dayOfWeek ) {
        return dayOfWeek > 0 && dayOfWeek <= 7;
    };

    CalendarHelper.sprintf0d = function( sb, value, width ) {
        var d = value;
        if (d < 0) {
            sb += '-';
            d = -d;
            --width;
        }
        var n = 10;
        var i;
        for (i = 2; i < width; i++) {
            n *= 10;
        }
        for (i = 1; i < width && d < n; i++) {
            sb += '0';
            n /= 10;
        }
        sb += d;
        return sb;
    };

    global.CalendarHelper = CalendarHelper;

    return CalendarHelper;

} ) );
