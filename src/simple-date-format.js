( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.require( "../resources/format-data" );
        module.require( "./resource-bundle" );
        module.require( "./locale" );
        module.require( "./field-position" );
        module.require( "./parse-position" );
        module.require( "./number-format" );
        module.require( "./decimal-format" );
        module.require( "./calendar-helper" );
        module.require( "./date-format" );
        module.require( "./date-format-symbols" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    function SimpleDateFormat() {
        var _date;
        var _numberFormat;
        var _pattern;
        var _originalNumberFormat;
        var _originalNumberPattern;
        var _minusSign = "-";
        var _hasFollowingMinusSign = false;
        var _compiledPattern;
        var _zeroDigit;
        var _formatData;
        var _defaultCenturyStart;
        var _defaultCenturyStartYear;
        var _locale;
        var _useDateFormatSymbols = false;

        var _initialize = function( loc ) {
            // Verify and compile the given pattern.
            _compiledPattern = _compile( _pattern );

            _numberFormat = global.NumberFormat.getIntegerInstance( loc );
            _numberFormat.setGroupingUsed( false );

            _initializeDefaultCentury();
        };

        var _initializeCalendar = function( loc ) {
            _date = new Date();
        };

        var _initializeDefaultCentury = function() {
            var date = new Date();
            date.setFullYear( date.getFullYear() - 80 );
            _parseAmbiguousDatesAsAfter( date );
        };

        var _parseAmbiguousDatesAsAfter = function( startDate ) {
            _defaultCenturyStart = startDate;
            _date = new Date( startDate.getTime() );
            _defaultCenturyStartYear = _date.getFullYear();
        };

        var _compile = function( pattern ) {
            var length = pattern.length;
            var inQuote = false;
            var compiledPattern = "";
            var tmpBuffer = null;
            var count = 0;
            var lastTag = -1;

            for ( var i = 0; i < length; i++ ) {
                var c = pattern.charAt( i );

                if ( c == '\'' ) {
                    // '' is treated as a single quote regardless of being
                    // in a quoted section.
                    if ( ( i + 1 ) < length ) {
                        c = pattern.charAt( i + 1 );
                        if ( c == '\'' ) {
                            i++;
                            if (count != 0) {
                                compiledPattern = _encode( lastTag, count, compiledPattern );
                                lastTag = -1;
                                count = 0;
                            }
                            if ( inQuote ) {
                                tmpBuffer += c;
                            } else {
                                compiledPattern += String.fromCharCode( _TAG_QUOTE_ASCII_CHAR << 8 | c.charCodeAt( 0 ) );
                            }
                            continue;
                        }
                    }
                    if ( !inQuote ) {
                        if ( count != 0 ) {
                            compiledPattern = _encode( lastTag, count, compiledPattern );
                            lastTag = -1;
                            count = 0;
                        }
                        tmpBuffer = "";
                        inQuote = true;
                    } else {
                        var len = tmpBuffer.length;
                        if ( len == 1 ) {
                            var ch = tmpBuffer.charAt( 0 );
                            if ( ch < 128 ) {
                                compiledPattern += String.fromCharCode( _TAG_QUOTE_ASCII_CHAR << 8 | ch.charCodeAt( 0 ) );
                            } else {
                                compiledPattern += String.fromCharCode( _TAG_QUOTE_CHARS << 8 | 1 );
                                compiledPattern += ch;
                            }
                        } else {
                            compiledPattern = _encode( _TAG_QUOTE_CHARS, len, compiledPattern );
                            compiledPattern += tmpBuffer;
                        }
                        inQuote = false;
                    }
                    continue;
                }
                if ( inQuote ) {
                    tmpBuffer += c;
                    continue;
                }
                if ( !(c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z') ) {
                    if ( count != 0 ) {
                        compiledPattern = _encode( lastTag, count, compiledPattern );
                        lastTag = -1;
                        count = 0;
                    }
                    if ( c < 128 ) {
                        // In most cases, c would be a delimiter, such as ':'.
                        compiledPattern += String.fromCharCode( _TAG_QUOTE_ASCII_CHAR << 8 | c.charCodeAt( 0 ) );
                    } else {
                        // Take any contiguous non-ASCII alphabet characters and
                        // put them in a single TAG_QUOTE_CHARS.
                        var j;
                        for ( j = i + 1; j < length; j++ ) {
                            var d = pattern.charAt(j);
                            if ( d == '\'' || ( d >= 'a' && d <= 'z' || d >= 'A' && d <= 'Z' ) ) {
                                break;
                            }
                        }
                        compiledPattern += String.fromCharCode(_TAG_QUOTE_CHARS << 8 | ( j - i ) );
                        for ( ; i < j; i++ ) {
                            compiledPattern += pattern.charAt( i );
                        }
                        i--;
                    }
                    continue;
                }

                var tag;
                if ( ( tag = global.DateFormatSymbols.patternChars.indexOf( c ) ) == -1 ) {
                    throw "Illegal pattern character " +
                        "'" + c + "'";
                }
                if ( lastTag == -1 || lastTag == tag ) {
                    lastTag = tag;
                    count++;
                    continue;
                }
                compiledPattern = _encode( lastTag, count, compiledPattern );
                lastTag = tag;
                count = 1;
            }

            if ( inQuote ) {
                throw "Unterminated quote";
            }

            if ( count != 0 ) {
                compiledPattern = _encode( lastTag, count, compiledPattern );
            }

            // Copy the compiled pattern to a char array
            return compiledPattern.split( "" );
        };

        var _subFormat = function( patternCharIndex, count, buffer, useDateFormatSymbols ) {
            var maxIntCount = 0x7fffffff;
            var current = null;
            // var beginOffset = buffer.length;

            var field = _PATTERN_INDEX_TO_CALENDAR_FIELD[patternCharIndex];
            var value;
            if (field == 17) {
                patternCharIndex = global.DateFormatSymbols.PATTERN_YEAR;
                field = _PATTERN_INDEX_TO_CALENDAR_FIELD[patternCharIndex];
                value = global.CalendarHelper.getField( _date, field );
            } else if (field == 1000) {
                value = global.CalendarHelper.toISODayOfWeek(CalendarHelper.getField( _date, 7 ));
            } else {
                value = CalendarHelper.getField( _date, field );
            }

            /*var style = (count >= 4) ? 2 : 1;
            if (!useDateFormatSymbols && field != 1000) {
                current = calendar.getDisplayName(field, style, locale);
            }*/

            // Note: zeroPaddingNumber() assumes that maxDigits is either
            // 2 or maxIntCount. If we make any changes to this,
            // zeroPaddingNumber() must be fixed.

            switch (patternCharIndex) {
                case global.DateFormatSymbols.PATTERN_ERA: // 'G'
                    if (useDateFormatSymbols) {
                        var eras = _formatData.getEras();
                        if (value < eras.length)
                            current = eras[value];
                    }
                    if (current == null)
                        current = "";
                    break;

                case global.DateFormatSymbols.PATTERN_WEEK_YEAR: // 'Y'
                case global.DateFormatSymbols.PATTERN_YEAR:      // 'y'
                    if (count != 2)
                        buffer = _zeroPaddingNumber(value, count, maxIntCount, buffer);
                    else // count == 2
                        buffer = _zeroPaddingNumber(value, 2, 2, buffer); // clip 1996 to 96
                    break;

                case global.DateFormatSymbols.PATTERN_MONTH: // 'M'
                    if (useDateFormatSymbols) {
                        var months;
                        if (count >= 4) {
                            months = _formatData.getMonths();
                            current = months[value];
                        } else if (count == 3) {
                            months = _formatData.getShortMonths();
                            current = months[value];
                        }
                    } else {
                        if (count < 3) {
                            current = null;
                        }
                    }
                    if (current == null) {
                        buffer = _zeroPaddingNumber(value+1, count, maxIntCount, buffer);
                    }
                    break;

                case global.DateFormatSymbols.PATTERN_HOUR_OF_DAY1: // 'k' 1-based.  eg, 23:59 + 1 hour =>> 24:59
                    if (current == null) {
                        if (value == 0)
                            buffer = _zeroPaddingNumber(CalendarHelper.getField( _date, 11 ) + 24,
                                count, maxIntCount, buffer);
                        else
                            buffer = _zeroPaddingNumber(value, count, maxIntCount, buffer);
                    }
                    break;

                case global.DateFormatSymbols.PATTERN_DAY_OF_WEEK: // 'E'
                    if (useDateFormatSymbols) {
                        var weekdays;
                        if (count >= 4) {
                            weekdays = _formatData.getWeekdays();
                            current = weekdays[value];
                        } else { // count < 4, use abbreviated form if exists
                            weekdays = _formatData.getShortWeekdays();
                            current = weekdays[value];
                        }
                    }
                    break;

                case global.DateFormatSymbols.PATTERN_AM_PM:    // 'a'
                    if (useDateFormatSymbols) {
                        var ampm = _formatData.getAmPmStrings();
                        current = ampm[value];
                    }
                    break;

                case global.DateFormatSymbols.PATTERN_HOUR1:    // 'h' 1-based.  eg, 11PM + 1 hour =>> 12 AM
                    if (current == null) {
                        if (value == 0)
                            buffer = _zeroPaddingNumber(CalendarHelper.getField( _date, 10 ) + 12,
                                count, maxIntCount, buffer);
                        else
                            buffer = _zeroPaddingNumber(value, count, maxIntCount, buffer);
                    }
                    break;

                // TODO: Use time zones
                /*case global.DateFormatSymbols.PATTERN_ZONE_NAME: // 'z'
                    if (current == null) {
                        if (formatData.locale == null || formatData.isZoneStringsSet) {
                            int zoneIndex =
                                formatData.getZoneIndex(calendar.getTimeZone().getID());
                            if (zoneIndex == -1) {
                                value = calendar.get(Calendar.ZONE_OFFSET) +
                                    calendar.get(Calendar.DST_OFFSET);
                                buffer.append(ZoneInfoFile.toCustomID(value));
                            } else {
                                int index = (calendar.get(Calendar.DST_OFFSET) == 0) ? 1: 3;
                                if (count < 4) {
                                    // Use the short name
                                    index++;
                                }
                                String[][] zoneStrings = formatData.getZoneStringsWrapper();
                                buffer.append(zoneStrings[zoneIndex][index]);
                            }
                        } else {
                            TimeZone tz = calendar.getTimeZone();
                            boolean daylight = (calendar.get(Calendar.DST_OFFSET) != 0);
                            int tzstyle = (count < 4 ? TimeZone.SHORT : TimeZone.LONG);
                            buffer.append(tz.getDisplayName(daylight, tzstyle, formatData.locale));
                        }
                    }
                    break;*/

                case global.DateFormatSymbols.PATTERN_ZONE_VALUE: // 'Z' ("-/+hhmm" form)
                    value = -CalendarHelper.getField( _date, 15 );

                    var width = 4;
                    if (value >= 0) {
                        buffer += '+';
                    } else {
                        width++;
                    }

                    var num = (value / 60) * 100 + (value % 60);
                    buffer = CalendarHelper.sprintf0d(buffer, num, width);
                    break;

                case global.DateFormatSymbols.PATTERN_ISO_ZONE:   // 'X'
                    value = -CalendarHelper.getField( _date, 15 );

                    if (value == 0) {
                        buffer += 'Z';
                        break;
                    }

                    // value /=  60000;
                    if (value >= 0) {
                        buffer += '+';
                    } else {
                        buffer += '-';
                        value = -value;
                    }

                    buffer = CalendarHelper.sprintf0d(buffer, value / 60, 2);
                    if (count == 1) {
                        break;
                    }

                    if (count == 3) {
                        buffer += ':';
                    }
                    buffer = CalendarHelper.sprintf0d(buffer, value % 60, 2);
                    break;

                default:
                    // case PATTERN_DAY_OF_MONTH:         // 'd'
                    // case PATTERN_HOUR_OF_DAY0:         // 'H' 0-based.  eg, 23:59 + 1 hour =>> 00:59
                    // case PATTERN_MINUTE:               // 'm'
                    // case PATTERN_SECOND:               // 's'
                    // case PATTERN_MILLISECOND:          // 'S'
                    // case PATTERN_DAY_OF_YEAR:          // 'D'
                    // case PATTERN_DAY_OF_WEEK_IN_MONTH: // 'F'
                    // case PATTERN_WEEK_OF_YEAR:         // 'w'
                    // case PATTERN_WEEK_OF_MONTH:        // 'W'
                    // case PATTERN_HOUR0:                // 'K' eg, 11PM + 1 hour =>> 0 AM
                    // case PATTERN_ISO_DAY_OF_WEEK:      // 'u' pseudo field, Monday = 1, ..., Sunday = 7
                    if (current == null) {
                        buffer = _zeroPaddingNumber(value, count, maxIntCount, buffer);
                    }
                    break;
            } // switch (patternCharIndex)

            if (current != null) {
                buffer += current;
            }

            /*var fieldID = _PATTERN_INDEX_TO_DATE_FORMAT_FIELD[patternCharIndex];
            var f = _PATTERN_INDEX_TO_DATE_FORMAT_FIELD_ID[patternCharIndex];

            delegate.formatted(fieldID, f, f, beginOffset, buffer.length(), buffer);*/
            return buffer;
        };

        var _zeroPaddingNumber = function( value, minDigits, maxDigits, buffer ) {
            // Optimization for 1, 2 and 4 digit numbers. This should
            // cover most cases of formatting date/time related items.
            // Note: This optimization code assumes that maxDigits is
            // either 2 or Integer.MAX_VALUE (maxIntCount in format()).
            try {
                if (!_zeroDigit) {
                    _zeroDigit = _numberFormat.getDecimalFormatSymbols().getZeroDigit();
                }
                if (value >= 0) {
                    if (value < 100 && minDigits >= 1 && minDigits <= 2) {
                        if (value < 10) {
                            if (minDigits == 2) {
                                buffer += _zeroDigit.toString();
                            }
                            buffer += value.toString();
                        } else {
                            buffer += value.toString();
                        }
                        return buffer;
                    } else if (value >= 1000 && value < 10000) {
                        if (minDigits == 4) {
                            buffer += value.toString();
                            return buffer;
                        }
                        if (minDigits == 2 && maxDigits == 2) {
                            buffer = _zeroPaddingNumber(value % 100, 2, 2, buffer);
                            return buffer;
                        }
                    }
                }
            } catch ( e ) {
            }

            _numberFormat.setMinimumIntegerDigits(minDigits);
            _numberFormat.setMaximumIntegerDigits(maxDigits);
            buffer += _numberFormat.format(value);
            return buffer;
        };

        var _isDigit = function( c ) {
            return c >= '0' && c <= '9';
        };

        var _translatePattern = function( pattern, from, to ) {
            var result = "";
            var inQuote = false;
            for ( var i = 0; i < pattern.length; ++i ) {
                var c = pattern.charAt( i );
                if ( inQuote ) {
                    if ( c == '\'' )
                        inQuote = false;
                }
                else {
                    if ( c == '\'' )
                        inQuote = true;
                    else if ( ( c >= 'a' && c <= 'z' ) || ( c >= 'A' && c <= 'Z' ) ) {
                        var ci = from.indexOf( c );
                        if ( ci >= 0 ) {
                            // patternChars is longer than localPatternChars due
                            // to serialization compatibility. The pattern letters
                            // unsupported by localPatternChars pass through.
                            if ( ci < to.length ) {
                                c = to.charAt( ci );
                            }
                        } else {
                            throw "Illegal pattern " +
                                " character '" +
                                c + "'";
                        }
                    }
                }
                result += c;
            }
            if ( inQuote )
                throw "Unfinished quote in pattern";
            return result.toString();
        };

        var _checkNegativeNumberExpression = function() {
            if ((_numberFormat instanceof DecimalFormat) &&
                _numberFormat !== _originalNumberFormat) {
                var numberPattern = _numberFormat.toPattern();
                if (numberPattern !== _originalNumberPattern) {
                    _hasFollowingMinusSign = false;

                    var separatorIndex = numberPattern.indexOf( ';' );
                    // If the negative subpattern is not absent, we have to analayze
                    // it in order to check if it has a following minus sign.
                    if ( separatorIndex > -1 ) {
                        var minusIndex = numberPattern.indexOf( '-', separatorIndex );
                        if ((minusIndex > numberPattern.lastIndexOf('0')) &&
                            (minusIndex > numberPattern.lastIndexOf('#'))) {
                            _hasFollowingMinusSign = true;
                            _minusSign = _numberFormat.getDecimalFormatSymbols().getMinusSign();
                        }
                    }
                    _originalNumberPattern = numberPattern;
                }
                _originalNumberFormat = _numberFormat;
            }
        };

        var _init = function() {
            if ( arguments.length > 0 ) {
                var pattern = arguments[ 0 ];
                if ( arguments.length == 1 ) {
                    _locale = global.Locale.getDefault();
                    _formatData = new global.DateFormatSymbols( _locale );
                } else if ( arguments.length == 2 ) {
                    var arg1 = arguments[ 1 ];
                    if ( arg1 instanceof global.Locale ) {
                        _locale = arg1;
                        _formatData = new global.DateFormatSymbols( _locale );
                    } else if ( arg1 instanceof global.DateFormatSymbols) {
                        _formatData = arg1;
                        _locale = global.Locale.getDefault();
                        _useDateFormatSymbols = true;
                    }
                }
                _pattern = pattern;
                _initializeCalendar( _locale );
                _initialize( _locale );
            } else {
                var timeStyle = global.DateFormat.SHORT;
                var dateStyle = global.DateFormat.SHORT;
                var loc = global.Locale.getDefault();
                _locale = loc;
                // initialize calendar and related fields
                _initializeCalendar( loc );

                var r = global.ResourceBundle.getBundle( "FormatData", loc );
                var dateTimePatterns = r[ "DateTimePatterns" ];
                _formatData = new global.DateFormatSymbols( loc );
                if ( ( timeStyle >= 0 ) && ( dateStyle >= 0 ) ) {
                    var dateTimeArgs = [ dateTimePatterns[ timeStyle ],
                        dateTimePatterns[ dateStyle + 4 ] ];
                    // _pattern = MessageFormat.format(dateTimePatterns[ 8 ], dateTimeArgs);
                    _pattern = dateTimeArgs.reverse().join( " " );
                }
                else if ( timeStyle >= 0 ) {
                    _pattern = dateTimePatterns[ timeStyle ];
                }
                else if ( dateStyle >= 0 ) {
                    _pattern = dateTimePatterns[ dateStyle + 4 ];
                }
                else {
                    throw "No date or time style specified";
                }

                _initialize( loc );
            }
        };

        this.set2DigitYearStart = function( startDate ) {
            _parseAmbiguousDatesAsAfter( new Date( startDate.getTime() ) );
        };

        this.get2DigitYearStart = function() {
            return new Date( _defaultCenturyStart.getTime() );
        };

        this.format = function( date ) {
            var toAppendTo = "";
            // Convert input date to time field list
            _date = date;

            var useDateFormatSymbols = _useDateFormatSymbols || true;

            for ( var i = 0; i < _compiledPattern.length; ) {
                var tag = _compiledPattern[ i ].charCodeAt( 0 ) >>> 8;
                var count = _compiledPattern[ i++ ].charCodeAt( 0 ) & 0xff;
                if ( count == 255 ) {
                    count = _compiledPattern[ i++ ].charCodeAt( 0 ) << 16;
                    count |= _compiledPattern[ i++ ].charCodeAt( 0 );
                }

                switch ( tag ) {
                case _TAG_QUOTE_ASCII_CHAR:
                    toAppendTo += String.fromCharCode( count );
                    break;

                case _TAG_QUOTE_CHARS:
                    toAppendTo += _compiledPattern.slice( i, i + count ).join( "" );
                    i += count;
                    break;

                default:
                    toAppendTo = _subFormat( tag, count, toAppendTo, useDateFormatSymbols );
                    break;
                }
            }
            return toAppendTo;
        };

        this.toPattern = function() {
            return _pattern;
        };

        this.toLocalizedPattern = function() {
            return _translatePattern( _pattern,
                    DateFormatSymbols.patternChars,
                    _formatData.getLocalPatternChars() );
        };

        this.applyPattern = function( pattern ) {
            _compiledPattern = _compile( pattern );
            _pattern = pattern;
        };

        this.applyLocalizedPattern = function( pattern ) {
            var p = _translatePattern( _pattern,
                    DateFormatSymbols.patternChars,
                    _formatData.getLocalPatternChars() );
            _compiledPattern = _compile( p );
            _pattern = p;
        };

        this.getDateFormatSymbols = function() {
            return _formatData;
        };

        this.setDateFormatSymbols = function( newFormatSymbols ) {
            _formatData = newFormatSymbols;
            _useDateFormatSymbols = true;
        };

        _init.apply( this, arguments );
    }

    var _TAG_QUOTE_ASCII_CHAR       = 100;
    var _TAG_QUOTE_CHARS            = 101;

    var _MILLIS_PER_MINUTE = 60 * 1000;
    var _GMT = "GMT";

    // Map index into pattern character string to Calendar field number
    // Calendar.ERA,
    // Calendar.YEAR,
    // Calendar.MONTH,
    // Calendar.DATE,
    // Calendar.HOUR_OF_DAY,
    // Calendar.HOUR_OF_DAY,
    // Calendar.MINUTE,
    // Calendar.SECOND,
    // Calendar.MILLISECOND,
    // Calendar.DAY_OF_WEEK,
    // Calendar.DAY_OF_YEAR,
    // Calendar.DAY_OF_WEEK_IN_MONTH,
    // Calendar.WEEK_OF_YEAR,
    // Calendar.WEEK_OF_MONTH,
    // Calendar.AM_PM,
    // Calendar.HOUR,
    // Calendar.HOUR,
    // Calendar.ZONE_OFFSET,
    // Calendar.ZONE_OFFSET,
    // CalendarBuilder.WEEK_YEAR,
    // CalendarBuilder.ISO_DAY_OF_WEEK,
    // Calendar.ZONE_OFFSET
    var _PATTERN_INDEX_TO_CALENDAR_FIELD = [
        0, 1, 2, 5, 11, 11, 12, 13, 14, 7, 6, 8, 3, 4, 9, 10, 10, 15, 15, 17, 1000, 15
    ];

    // Map index into pattern character string to DateFormat field number
    var _PATTERN_INDEX_TO_DATE_FORMAT_FIELD = [
        global.DateFormat.ERA_FIELD,
        global.DateFormat.YEAR_FIELD,
        global.DateFormat.MONTH_FIELD,
        global.DateFormat.DATE_FIELD,
        global.DateFormat.HOUR_OF_DAY1_FIELD,
        global.DateFormat.HOUR_OF_DAY0_FIELD,
        global.DateFormat.MINUTE_FIELD,
        global.DateFormat.SECOND_FIELD,
        global.DateFormat.MILLISECOND_FIELD,
        global.DateFormat.DAY_OF_WEEK_FIELD,
        global.DateFormat.DAY_OF_YEAR_FIELD,
        global.DateFormat.DAY_OF_WEEK_IN_MONTH_FIELD,
        global.DateFormat.WEEK_OF_YEAR_FIELD,
        global.DateFormat.WEEK_OF_MONTH_FIELD,
        global.DateFormat.AM_PM_FIELD,
        global.DateFormat.HOUR1_FIELD,
        global.DateFormat.HOUR0_FIELD,
        global.DateFormat.TIMEZONE_FIELD,
        global.DateFormat.TIMEZONE_FIELD,
        global.DateFormat.YEAR_FIELD,
        global.DateFormat.DAY_OF_WEEK_FIELD,
        global.DateFormat.TIMEZONE_FIELD
    ];

    // Maps from DateFormatSymbols index to Field constant
    var _PATTERN_INDEX_TO_DATE_FORMAT_FIELD_ID = [
        global.DateFormat.Field.ERA,
        global.DateFormat.Field.YEAR,
        global.DateFormat.Field.MONTH,
        global.DateFormat.Field.DAY_OF_MONTH,
        global.DateFormat.Field.HOUR_OF_DAY1,
        global.DateFormat.Field.HOUR_OF_DAY0,
        global.DateFormat.Field.MINUTE,
        global.DateFormat.Field.SECOND,
        global.DateFormat.Field.MILLISECOND,
        global.DateFormat.Field.DAY_OF_WEEK,
        global.DateFormat.Field.DAY_OF_YEAR,
        global.DateFormat.Field.DAY_OF_WEEK_IN_MONTH,
        global.DateFormat.Field.WEEK_OF_YEAR,
        global.DateFormat.Field.WEEK_OF_MONTH,
        global.DateFormat.Field.AM_PM,
        global.DateFormat.Field.HOUR1,
        global.DateFormat.Field.HOUR0,
        global.DateFormat.Field.TIME_ZONE,
        global.DateFormat.Field.TIME_ZONE,
        global.DateFormat.Field.YEAR,
        global.DateFormat.Field.DAY_OF_WEEK,
        global.DateFormat.Field.TIME_ZONE
    ];

    var _encode = function( tag, length, buffer ) {
        if ( tag == global.DateFormat.PATTERN_ISO_ZONE && length >= 4 ) {
            throw "invalid ISO 8601 format: length=" + length;
        }
        if ( length < 255 ) {
            buffer += String.fromCharCode( tag << 8 | length );
        } else {
            buffer += String.fromCharCode( tag << 8 | 0xff );
            buffer += String.fromCharCode( length >>> 16 );
            buffer += String.fromCharCode( length & 0xffff );
        }
        return buffer;
    };

    SimpleDateFormat.prototype = Object.create( global.DateFormat.prototype );

    SimpleDateFormat.prototype.constructor = SimpleDateFormat;

    global.SimpleDateFormat = SimpleDateFormat;

    return SimpleDateFormat;

} ) );
