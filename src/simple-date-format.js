( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
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

        var _matchString = function( text, start, field, data, date ) {
            var i = 0;
            var count = data.length;

            if (field == 7) i = 1;

            // There may be multiple strings in the data[] array which begin with
            // the same prefix (e.g., Cerven and Cervenec (June and July) in Czech).
            // We keep track of the longest match, and return that.  Note that this
            // unfortunately requires us to test all array elements.
            var bestMatchLength = 0, bestMatch = -1;
            for (; i<count; ++i)
            {
                var length = data[i].length;
                // Always compare if we have no match yet; otherwise only compare
                // against potentially better matches (longer strings).
                if (length > bestMatchLength &&
                    text.substr(start, length).search(new RegExp(data[i], "i")) > -1)
                {
                    bestMatch = i;
                    bestMatchLength = length;
                }
            }
            if (bestMatch >= 0)
            {
                global.CalendarHelper.setField(date, field, bestMatch);
                return start + bestMatchLength;
            }
            return -start;
        };

        var _subParseNumericZone = function( text, start, sign, count, colon ) {
            var index = start;
            parse:
            try {
                var c = text.charAt(index++);
                // Parse hh
                var hours;
                if (!_isDigit(c)) {
                    break parse;
                }
                hours = parseInt(c, 10);
                c = text.charAt(index++);
                if (_isDigit(c)) {
                    hours = hours * 10 + parseInt(c, 10);
                } else {
                    // If no colon in RFC 822 or 'X' (ISO), two digits are
                    // required.
                    if (count > 0 || !colon) {
                        break parse;
                    }
                    --index;
                }
                if (hours > 23) {
                    break parse;
                }
                var minutes = 0;
                if (count != 1) {
                    // Proceed with parsing mm
                    c = text.charAt(index++);
                    if (colon) {
                        if (c != ':') {
                            break parse;
                        }
                        c = text.charAt(index++);
                    }
                    if (!_isDigit(c)) {
                        break parse;
                    }
                    minutes = parseInt(c, 10);
                    c = text.charAt(index++);
                    if (!_isDigit(c)) {
                        break parse;
                    }
                    minutes = minutes * 10 + parseInt(c, 10);
                    if (minutes > 59) {
                        break parse;
                    }
                }
                /*minutes += hours * 60;
                calb.set(Calendar.ZONE_OFFSET, minutes * MILLIS_PER_MINUTE * sign)
                    .set(Calendar.DST_OFFSET, 0);*/
                return index;
            } catch ( e ) {}
            return 1 - index;
        };

        var _isDigit = function( c ) {
            return c >= '0' && c <= '9';
        };

        var _subParse = function( text, start, patternCharIndex, count,
            obeyCount, ambiguousYear, origPos, useFollowingMinusSignAsDelimiter, date) {
            var number = null;
            var value = 0;
            var pos = new global.ParsePosition(0);
            pos.index = start;
            if (patternCharIndex == global.DateFormatSymbols.PATTERN_WEEK_YEAR) {
                // use calendar year 'y' instead
                patternCharIndex = global.DateFormatSymbols.PATTERN_YEAR;
            }
            var field = _PATTERN_INDEX_TO_CALENDAR_FIELD[patternCharIndex];

            // If there are any spaces here, skip over them.  If we hit the end
            // of the string, then fail.
            for (;;) {
                if (pos.index >= text.length) {
                    origPos.errorIndex = start;
                    return -1;
                }
                var c = text.charAt(pos.index);
                if (c != ' ' && c != '\t') break;
                ++pos.index;
            }

            parsing:
            {
                // We handle a few special cases here where we need to parse
                // a number value.  We handle further, more generic cases below.  We need
                // to handle some of them here because some fields require extra processing on
                // the parsed value.
                if (patternCharIndex == global.DateFormatSymbols.PATTERN_HOUR_OF_DAY1 ||
                    patternCharIndex == global.DateFormatSymbols.PATTERN_HOUR1 ||
                    (patternCharIndex == global.DateFormatSymbols.PATTERN_MONTH && count <= 2) ||
                    patternCharIndex == global.DateFormatSymbols.PATTERN_YEAR ||
                    patternCharIndex == global.DateFormatSymbols.PATTERN_WEEK_YEAR) {
                    // It would be good to unify this with the obeyCount logic below,
                    // but that's going to be difficult.
                    if (obeyCount) {
                        if ((start+count) > text.length) {
                            break parsing;
                        }
                        number = _numberFormat.parse(text.substring(0, start+count), pos);
                    } else {
                        number = _numberFormat.parse(text, pos);
                    }
                    if (number == null) {
                        if (patternCharIndex != global.DateFormatSymbols.PATTERN_YEAR) {
                            break parsing;
                        }
                    } else {
                        value = parseInt(number, 10);

                        if (useFollowingMinusSignAsDelimiter && (value < 0) &&
                            (((pos.index < text.length) &&
                            (text.charAt(pos.index) != _minusSign)) ||
                            ((pos.index == text.length) &&
                            (text.charAt(pos.index-1) == _minusSign)))) {
                            value = -value;
                            pos.index--;
                        }
                    }
                }

                var useDateFormatSymbols = true;

                var index;
                switch (patternCharIndex) {
                    case global.DateFormatSymbols.PATTERN_ERA: // 'G'
                        if (useDateFormatSymbols) {
                            if ((index = _matchString(text, start, 0, _formatData.getEras(), date)) > 0) {
                                return index;
                            }
                        } else {
                            /*Map<String, Integer> map = calendar.getDisplayNames(field,
                                Calendar.ALL_STYLES,
                                locale);
                            if ((index = matchString(text, start, field, map, calb)) > 0) {
                                return index;
                            }*/
                        }
                        break parsing;

                    case global.DateFormatSymbols.PATTERN_WEEK_YEAR: // 'Y'
                    case global.DateFormatSymbols.PATTERN_YEAR:      // 'y'
                        /*if (!(calendar instanceof GregorianCalendar)) {
                            // calendar might have text representations for year values,
                            // such as "\u5143" in JapaneseImperialCalendar.
                            int style = (count >= 4) ? Calendar.LONG : Calendar.SHORT;
                            Map<String, Integer> map = calendar.getDisplayNames(field, style, locale);
                            if (map != null) {
                                if ((index = matchString(text, start, field, map, calb)) > 0) {
                                    return index;
                                }
                            }
                            calb.set(field, value);
                            return pos.index;
                        }*/

                        // If there are 3 or more YEAR pattern characters, this indicates
                        // that the year value is to be treated literally, without any
                        // two-digit year adjustments (e.g., from "01" to 2001).  Otherwise
                        // we made adjustments to place the 2-digit year in the proper
                        // century, for parsed strings from "00" to "99".  Any other string
                        // is treated literally:  "2250", "-1", "1", "002".
                        if (count <= 2 && (pos.index - start) == 2
                            && _isDigit(text.charAt(start))
                            && _isDigit(text.charAt(start+1))) {
                            // Assume for example that the defaultCenturyStart is 6/18/1903.
                            // This means that two-digit years will be forced into the range
                            // 6/18/1903 to 6/17/2003.  As a result, years 00, 01, and 02
                            // correspond to 2000, 2001, and 2002.  Years 04, 05, etc. correspond
                            // to 1904, 1905, etc.  If the year is 03, then it is 2003 if the
                            // other fields specify a date before 6/18, or 1903 if they specify a
                            // date afterwards.  As a result, 03 is an ambiguous year.  All other
                            // two-digit years are unambiguous.
                            var ambiguousTwoDigitYear = _defaultCenturyStartYear % 100;
                            ambiguousYear[0] = value == ambiguousTwoDigitYear;
                            value += (Math.floor(_defaultCenturyStartYear/100))*100 +
                                (value < ambiguousTwoDigitYear ? 100 : 0);
                        }
                        date.setFullYear(value);
                        return pos.index;

                    case global.DateFormatSymbols.PATTERN_MONTH: // 'M'
                        if (count <= 2) // i.e., M or MM.
                        {
                            // Don't want to parse the month if it is a string
                            // while pattern uses numeric style: M or MM.
                            // [We computed 'value' above.]
                            global.CalendarHelper.setField(date, 2, value - 1);
                            return pos.index;
                        }

                        if (useDateFormatSymbols) {
                            // count >= 3 // i.e., MMM or MMMM
                            // Want to be able to parse both short and long forms.
                            // Try count == 4 first:
                            var newStart = 0;
                            if ((newStart = _matchString(text, start, 2,
                                    _formatData.getMonths(), date)) > 0) {
                                return newStart;
                            }
                            // count == 4 failed, now try count == 3
                            if ((index = _matchString(text, start, 2,
                                    _formatData.getShortMonths(), date)) > 0) {
                                return index;
                            }
                        } else {
                            /*Map<String, Integer> map = calendar.getDisplayNames(field,
                                Calendar.ALL_STYLES,
                                locale);
                            if ((index = matchString(text, start, field, map, calb)) > 0) {
                                return index;
                            }*/
                        }
                        break parsing;

                    case global.DateFormatSymbols.PATTERN_HOUR_OF_DAY1: // 'k' 1-based.  eg, 23:59 + 1 hour =>> 24:59
                        /*if (!isLenient()) {
                            // Validate the hour value in non-lenient
                            if (value < 1 || value > 24) {
                                break parsing;
                            }
                        }*/
                        // [We computed 'value' above.]
                        if (value == 24)
                            value = 0;
                        global.CalendarHelper.setField(date, 11, value);
                        return pos.index;

                    case global.DateFormatSymbols.PATTERN_DAY_OF_WEEK:  // 'E'
                    {
                        if (useDateFormatSymbols) {
                            // Want to be able to parse both short and long forms.
                            // Try count == 4 (DDDD) first:
                            var newStart = 0;
                            if ((newStart=_matchString(text, start, 7,
                                    _formatData.getWeekdays(), date)) > 0) {
                                return newStart;
                            }
                            // DDDD failed, now try DDD
                            if ((index = _matchString(text, start, 7,
                                    _formatData.getShortWeekdays(), date)) > 0) {
                                return index;
                            }
                        } else {
                            /*int[] styles = { Calendar.LONG, Calendar.SHORT };
                            for (int style : styles) {
                                Map<String,Integer> map = calendar.getDisplayNames(field, style, locale);
                                if ((index = matchString(text, start, field, map, calb)) > 0) {
                                    return index;
                                }
                            }*/
                        }
                    }
                        break parsing;

                    case global.DateFormatSymbols.PATTERN_AM_PM:    // 'a'
                        if (useDateFormatSymbols) {
                            if ((index = _matchString(text, start, 9,
                                    _formatData.getAmPmStrings(), date)) > 0) {
                                return index;
                            }
                        } else {
                            /*Map<String,Integer> map = calendar.getDisplayNames(field, Calendar.ALL_STYLES, locale);
                            if ((index = matchString(text, start, field, map, calb)) > 0) {
                                return index;
                            }*/
                        }
                        break parsing;

                    case global.DateFormatSymbols.PATTERN_HOUR1: // 'h' 1-based.  eg, 11PM + 1 hour =>> 12 AM
                        /*if (!isLenient()) {
                            // Validate the hour value in non-lenient
                            if (value < 1 || value > 12) {
                                break parsing;
                            }
                        }*/
                        // [We computed 'value' above.]
                        if (value == 12)
                            value = 0;
                        global.CalendarHelper.setField(date, 10, value);
                        return pos.index;

                    case global.DateFormatSymbols.PATTERN_ZONE_NAME:  // 'z'
                    case global.DateFormatSymbols.PATTERN_ZONE_VALUE: // 'Z'
                        {
                            var sign = 0;
                            try {
                                var c = text.charAt(pos.index);
                                if (c == '+') {
                                    sign = 1;
                                } else if (c == '-') {
                                    sign = -1;
                                }
                                if (sign == 0) {
                                    // Try parsing a custom time zone "GMT+hh:mm" or "GMT".
                                    if ((c == 'G' || c == 'g')
                                        && (text.length - start) >= _GMT.length
                                        && text.substr(start, _GMT.length).search(new RegExp(_GMT, "i")) > -1) {
                                        pos.index = start + _GMT.length;

                                        if ((text.length - pos.index) > 0) {
                                            c = text.charAt(pos.index);
                                            if (c == '+') {
                                                sign = 1;
                                            } else if (c == '-') {
                                                sign = -1;
                                            }
                                        }

                                        if (sign == 0) {    /* "GMT" without offset */
                                            /*calb.set(Calendar.ZONE_OFFSET, 0)
                                                .set(Calendar.DST_OFFSET, 0);*/
                                            return pos.index;
                                        }

                                        // Parse the rest as "hh:mm"
                                        var i = _subParseNumericZone(text, ++pos.index,
                                            sign, 0, true);
                                        if (i > 0) {
                                            return i;
                                        }
                                        pos.index = -i;
                                    } else {
                                        // Try parsing the text as a time zone
                                        // name or abbreviation.
                                        /*int i = subParseZoneString(text, pos.index, calb);
                                        if (i > 0) {
                                            return i;
                                        }
                                        pos.index = -i;*/
                                    }
                                } else {
                                    // Parse the rest as "hhmm" (RFC 822)
                                    var i = _subParseNumericZone(text, ++pos.index,
                                        sign, 0, false);
                                    if (i > 0) {
                                        return i;
                                    }
                                    pos.index = -i;
                                }
                            } catch (e) {
                            }
                        }
                        break parsing;

                    case global.DateFormatSymbols.PATTERN_ISO_ZONE:   // 'X'
                    {
                        if ((text.length - pos.index) <= 0) {
                            break parsing;
                        }

                        var sign = 0;
                        var c = text.charAt(pos.index);
                        if (c == 'Z') {
                            // calb.set(Calendar.ZONE_OFFSET, 0).set(Calendar.DST_OFFSET, 0);
                            return ++pos.index;
                        }

                        // parse text as "+/-hh[[:]mm]" based on count
                        if (c == '+') {
                            sign = 1;
                        } else if (c == '-') {
                            sign = -1;
                        } else {
                            ++pos.index;
                            break parsing;
                        }
                        var i = _subParseNumericZone(text, ++pos.index, sign, count,
                        count == 3);
                        if (i > 0) {
                            return i;
                        }
                        pos.index = -i;
                    }
                        break parsing;

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
                        // case PATTERN_HOUR0:                // 'K' 0-based.  eg, 11PM + 1 hour =>> 0 AM
                        // case PATTERN_ISO_DAY_OF_WEEK:      // 'u' (pseudo field);

                        // Handle "generic" fields
                        if (obeyCount) {
                            if ((start+count) > text.length) {
                                break parsing;
                            }
                            number = _numberFormat.parse(text.substring(0, start+count), pos);
                        } else {
                            number = _numberFormat.parse(text, pos);
                        }
                        if (number != null) {
                            value = parseInt(number, 10);

                            if (useFollowingMinusSignAsDelimiter && (value < 0) &&
                                (((pos.index < text.length) &&
                                (text.charAt(pos.index) != _minusSign)) ||
                                ((pos.index == text.length) &&
                                (text.charAt(pos.index-1) == _minusSign)))) {
                                value = -value;
                                pos.index--;
                            }

                            global.CalendarHelper.setField(date, field, value);
                            return pos.index;
                        }
                        break parsing;
                }
            }

            // Parsing failed.
            origPos.errorIndex = pos.index;
            return -1;
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
            if ( arguments.length > 0 && arguments.length <= 2 ) {
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
                var timeStyle = arguments.length > 0 && typeof arguments[ 0 ] != "undefined" ?
                    arguments[ 0 ] : global.DateFormat.SHORT;
                var dateStyle = arguments.length > 0 && typeof arguments[ 1 ] != "undefined" ?
                    arguments[ 1 ] : global.DateFormat.SHORT;
                var loc = arguments.length > 0 && typeof arguments[ 2 ] != "undefined" ?
                    arguments[ 2 ] : global.Locale.getDefault();
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

        this.setNumberFormat = function( newNumberFormat ) {
            _numberFormat = newNumberFormat;
        };

        this.getNumberFormat = function() {
            return _numberFormat;
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

        this.parse = function( text, pos ) {
            pos = pos || new global.ParsePosition( 0 );
            _checkNegativeNumberExpression();

            var start = pos.index;
            var oldStart = start;
            var textLength = text.length;

            var ambiguousYear = [ false ];

            var date = new Date( 0 );

            for (var i = 0; i < _compiledPattern.length; ) {
                var tag = _compiledPattern[i].charCodeAt( 0 ) >>> 8;
                var count = _compiledPattern[i++].charCodeAt( 0 ) & 0xff;
                if (count == 255) {
                    count = _compiledPattern[i++].charCodeAt( 0 ) << 16;
                    count |= _compiledPattern[i++].charCodeAt( 0 );
                }

                switch (tag) {
                case _TAG_QUOTE_ASCII_CHAR:
                    if (start >= textLength || text.charAt(start) != String.fromCharCode(count)) {
                        pos.index = oldStart;
                        pos.errorIndex = start;
                        return null;
                    }
                    start++;
                    break;

                case _TAG_QUOTE_CHARS:
                    while (count-- > 0) {
                        if (start >= textLength || text.charAt(start) != _compiledPattern[i++]) {
                            pos.index = oldStart;
                            pos.errorIndex = start;
                            return null;
                        }
                        start++;
                    }
                    break;

                default:
                    // Peek the next pattern to determine if we need to
                    // obey the number of pattern letters for
                    // parsing. It's required when parsing contiguous
                    // digit text (e.g., "20010704") with a pattern which
                    // has no delimiters between fields, like "yyyyMMdd".
                    var obeyCount = false;

                    // In Arabic, a minus sign for a negative number is put after
                    // the number. Even in another locale, a minus sign can be
                    // put after a number using DateFormat.setNumberFormat().
                    // If both the minus sign and the field-delimiter are '-',
                    // subParse() needs to determine whether a '-' after a number
                    // in the given text is a delimiter or is a minus sign for the
                    // preceding number. We give subParse() a clue based on the
                    // information in compiledPattern.
                    var useFollowingMinusSignAsDelimiter = false;

                    if (i < _compiledPattern.length) {
                        var nextTag = _compiledPattern[i].charCodeAt( 0 ) >>> 8;
                        if (!(nextTag == _TAG_QUOTE_ASCII_CHAR ||
                            nextTag == _TAG_QUOTE_CHARS)) {
                            obeyCount = true;
                        }

                        if (_hasFollowingMinusSign &&
                            (nextTag == _TAG_QUOTE_ASCII_CHAR ||
                            nextTag == _TAG_QUOTE_CHARS)) {
                            var c;
                            if (nextTag == _TAG_QUOTE_ASCII_CHAR) {
                                c = _compiledPattern[i].charCodeAt( 0 ) & 0xff;
                            } else {
                                c = _compiledPattern[i+1].charCodeAt( 0 );
                            }

                            if (String.fromCharCode(c) == _minusSign) {
                                useFollowingMinusSignAsDelimiter = true;
                            }
                        }
                    }
                    start = _subParse(text, start, tag, count, obeyCount,
                        ambiguousYear, pos,
                        useFollowingMinusSignAsDelimiter, date);
                    if (start < 0) {
                        pos.index = oldStart;
                        return null;
                    }
                }
            }

            // At this point the fields of Calendar have been set.  Calendar
            // will fill in default values for missing fields when the time
            // is computed.

            pos.index = start;

            var parsedDate;
            try {
                parsedDate = new Date(date.getTime());
                // If the year value is ambiguous,
                // then the two-digit year == the default start year
                if (ambiguousYear[0]) {
                    if (parsedDate.getTime() < _defaultCenturyStart.getTime()) {
                        parsedDate.setFullYear(date.getFullYear() + 100);
                    }
                }
            }
                // An IllegalArgumentException will be thrown by Calendar.getTime()
                // if any fields are out of range, e.g., MONTH == 17.
            catch (e) {
                pos.errorIndex = start;
                pos.index = oldStart;
                return null;
            }

            return parsedDate;
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

    SimpleDateFormat.prototype.equals = function( that ) {
        if ( !global.DateFormat.equals.apply( this, [ that ] ) ) return false; // super does class check
        if ( !( that instanceof SimpleDateFormat) ) return false;
        return ( this.toPattern() == that.toPattern()
            && this.getNumberFormat().equals( that.getNumberFormat() ) );
    };

    global.SimpleDateFormat = SimpleDateFormat;

    return SimpleDateFormat;

} ) );
