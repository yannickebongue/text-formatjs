( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        exports[ "CalendarHelper" ] = module.exports = factory( global );
    } else {
        factory( global );
    }

} )( this, function( global ) {

    function CalendarHelper() {}

    var _ONE_SECOND = 1000;
    var _ONE_MINUTE = _ONE_SECOND * 60;
    var _ONE_HOUR   = _ONE_MINUTE * 60;
    var _ONE_DAY    = _ONE_HOUR * 24;

    var _firstDayOfWeek = 1;
    var _minimalDaysInFirstWeek = 1;

    var _getWeekdayDelta = function( weekday ) {
        return ( ( weekday - ( _firstDayOfWeek - 1 ) + 7 ) % 7 );
    };

    CalendarHelper.setCalendarData = function( locale ) {
        var rb = ResourceBundle.getBundle( "CalendarData", locale );
        _firstDayOfWeek = parseInt( rb[ "firstDayOfWeek" ], 10 );
        _minimalDaysInFirstWeek = parseInt( rb[ "minimalDaysInFirstWeek" ], 10 );
    };

    CalendarHelper.getField = function( date, field ) {
        switch ( field ) {
        case 0:     // ERA
            return 1;
        case 1:     // YEAR
            return date.getFullYear();
        case 2:     // MONTH
            return date.getMonth();
        case 3:     // WEEK_OF_YEAR
            return CalendarHelper.getWeekNumber( date );
        case 4:     // WEEK_OF_MONTH
            return CalendarHelper.getMonthWeekNumber( date );
        case 5:     // DATE, DAY_OF_MONTH
            return date.getDate();
        case 6:     // DAY_OF_YEAR
            return CalendarHelper.computeDayOfYear( date );
        case 7:     // DAY_OF_WEEK
            return date.getDay() + 1;
        case 8:     // DAY_OF_WEEK_IN_MONTH
            return Math.floor( ( ( date.getDate() - 1 ) / 7 ) + 1 );
        case 9:     // AM_PM
            return date.getHours() < 12 ? 0 : 1;
        case 10:    // HOUR
            return date.getHours() % 12;
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

    CalendarHelper.setField = function( date, field, value ) {
        switch ( field ) {
        case 0:     // ERA
            break;
        case 1:     // YEAR
            date.setFullYear( value );
            break;
        case 2:     // MONTH
            date.setMonth( value );
            break;
        case 3:     // WEEK_OF_YEAR
            date.setTime( CalendarHelper.computeDateOfWeekOfYear( date.getFullYear(), value, date.getDay() ) );
            break;
        case 4:     // WEEK_OF_MONTH
            date.setTime( CalendarHelper.computeDateOfWeekOfMonth( date.getFullYear(), date.getMonth(), value, date.getDay() ) );
            break;
        case 5:     // DATE, DAY_OF_MONTH
            date.setDate( value );
            break;
        case 6:     // DAY_OF_YEAR
            date.setMonth( 0, value );
            break;
        case 7:     // DAY_OF_WEEK
            date.setDate( ( date.getDate() + value ) - ( date.getDay() + 1 ) );
            break;
        case 8:     // DAY_OF_WEEK_IN_MONTH
            date.setDate( ( value - CalendarHelper.getField( date, 8 ) ) * 7 + date.getDate() );
            break;
        case 9:     // AM_PM
            if ( value == 1 && date.getHours() < 12 ) {
                date.setHours( date.getHours() + 12 );
            }
            break;
        case 10:    // HOUR
        case 11:    // HOUR_OF_DAY
            date.setHours( value );
            break;
        case 12:    // MINUTE
            date.setMinutes( value );
            break;
        case 13:    // SECOND
            date.setSeconds( value );
            break;
        case 14:    // MILLISECOND
            date.setMilliseconds( value );
            break;
        case 15:    // ZONE_OFFSET
            date.setMinutes( date.getMinutes() + date.getTimezoneOffset() - value );
            break;
        case 16:    // DST_OFFSET
        default:
            break;
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

    CalendarHelper.getMonthWeekNumber = function( date ) {
        var firstWeekStartDate = new Date( date.getFullYear(), date.getMonth(), _minimalDaysInFirstWeek );
        firstWeekStartDate.setDate( firstWeekStartDate.getDate() - _getWeekdayDelta( firstWeekStartDate.getDay() ) );
        return Math.ceil( ( ( ( date - firstWeekStartDate ) / _ONE_DAY ) + 1 ) / 7 );
    };

    CalendarHelper.getWeekNumber = function( date ) {
        // var d = new Date( date.getTime() );
        // d.setHours( 0, 0, 0, 0);
        // d.setDate( d.getDate() + 4 - ( d.getDay() || 7 ) );
        // return Math.ceil( ( ( ( d - new Date( d.getFullYear(), 0, 1) ) / 86400000 ) + 1 ) / 7 );
        var firstWeekStartDate = new Date( date.getFullYear(), 0, _minimalDaysInFirstWeek );
        firstWeekStartDate.setDate( firstWeekStartDate.getDate() - _getWeekdayDelta( firstWeekStartDate.getDay() ) );
        var weekNr = Math.ceil( ( ( ( date - firstWeekStartDate ) / _ONE_DAY ) + 1 ) / 7 );
        return weekNr < 1 ? CalendarHelper.getWeekNumber( new Date( date.getFullYear(), 0, 0 ) ) : weekNr;
    };

    CalendarHelper.getWeekYear = function( date ) {
        var d = new Date( date.getTime() );
        // d.setDate( d.getDate() - ( ( date.getDay() + 6 ) % 7 ) + 3 );
        d.setDate( d.getDate() - _getWeekdayDelta( d.getDay() ) );
        return d.getFullYear();
    };

    CalendarHelper.computeDayOfYear = function( date ) {
        var year = date.getFullYear();
        var start = new Date( year, 0, 0, 0, 0, 0, 0 );
        var end = new Date( year, date.getMonth(), date.getDate(), 0, 0, 0, 0 );
        return Math.floor( ( end - start ) / _ONE_DAY );
    };

    CalendarHelper.computeDateOfWeekOfYear = function( year, weekOfYear, weekday ) {
        var dayOfYear = ( weekOfYear * 7 ) + ( weekday || 7  ) - ( ( new Date( year, 0, 4 ).getDay() || 7 ) + 3 );
        var daysInYear = CalendarHelper.computeDayOfYear( new Date( year + 1, 0, 0 ) );
        if ( dayOfYear < 1 ) {
            dayOfYear += CalendarHelper.computeDayOfYear( new Date( year, 0, 0 ) );
            year--;
        } else if ( dayOfYear > daysInYear ) {
            dayOfYear -= daysInYear;
            year++;
        }
        return new Date( year, 0, dayOfYear );
    };

    CalendarHelper.computeDateOfWeekOfMonth = function( year, month, weekOfMonth, weekday ) {
        var d = new Date( year, month, _minimalDaysInFirstWeek );
        d.setDate( d.getDate() - _getWeekdayDelta( d.getDay() ) );
        var dayOfMonth = d.getDate() + ( ( weekOfMonth - 1 ) * 7 ) + _getWeekdayDelta( weekday );
        return new Date( d.getFullYear(), d.getMonth(), dayOfMonth );
    };

    global.CalendarHelper = CalendarHelper;

    return CalendarHelper;

} );
