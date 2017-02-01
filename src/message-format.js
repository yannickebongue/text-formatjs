( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        exports[ "MessageFormat" ] = module.exports = factory( global );
    } else {
        factory( global );
    }

} )( this, function( global ) {

    var MessageFormat = function MessageFormat(pattern) {
        Format.call(this);

        var _this = this;

        var _locale;
        var _pattern;
        var _formats = new Array(_INITIAL_FORMATS);
        var _offsets = new Array(_INITIAL_FORMATS);
        var _argumentNumbers = new Array(_INITIAL_FORMATS);
        var _maxOffset = -1;

        var _makeFormat = function(position, offsetNumber, textSegments) {
            var segments = new Array(textSegments.length);
            for (var i = 0; i < textSegments.length; i++) {
                var oneseg = textSegments[i];
                segments[i] = oneseg ? oneseg.toString() : "";
            }

            // get the argument number
            var argumentNumber;
            try {
                argumentNumber = parseInt(segments[_SEG_INDEX], 10); // always unlocalized!
            } catch (e) {
                throw "can't parse argument number: "
                    + segments[_SEG_INDEX];
            }
            if (argumentNumber < 0) {
                throw "negative argument number: "
                    + argumentNumber;
            }

            // resize format information arrays if necessary
            if (offsetNumber >= _formats.length) {
                var newLength = _formats.length * 2;
                var newFormats = _formats.slice(0, _maxOffset + 1).concat(new Array(newLength - (_maxOffset + 1)));
                var newOffsets = _offsets.slice(0, _maxOffset + 1).concat(new Array(newLength - (_maxOffset + 1)));
                var newArgumentNumbers = _argumentNumbers.slice(0, _maxOffset + 1).concat(new Array(newLength - (_maxOffset + 1)));
                _formats = newFormats;
                _offsets = newOffsets;
                _argumentNumbers = newArgumentNumbers;
            }
            var oldMaxOffset = _maxOffset;
            _maxOffset = offsetNumber;
            _offsets[offsetNumber] = segments[_SEG_RAW].length;
            _argumentNumbers[offsetNumber] = argumentNumber;

            // now get the format
            var newFormat = null;
            if (segments[_SEG_TYPE].length != 0) {
                var type = _findKeyword(segments[_SEG_TYPE], _TYPE_KEYWORDS);
                switch (type) {
                    case _TYPE_NULL:
                        // Type "" is allowed. e.g., "{0,}", "{0,,}", and "{0,,#}"
                        // are treated as "{0}".
                        break;

                    case _TYPE_NUMBER:
                        switch (_findKeyword(segments[_SEG_MODIFIER], _NUMBER_MODIFIER_KEYWORDS)) {
                            case _MODIFIER_DEFAULT:
                                newFormat = NumberFormat.getInstance(_locale);
                                break;
                            case _MODIFIER_CURRENCY:
                                newFormat = NumberFormat.getCurrencyInstance(_locale);
                                break;
                            case _MODIFIER_PERCENT:
                                newFormat = NumberFormat.getPercentInstance(_locale);
                                break;
                            case _MODIFIER_INTEGER:
                                newFormat = NumberFormat.getIntegerInstance(_locale);
                                break;
                            default: // DecimalFormat pattern
                                try {
                                    newFormat = new DecimalFormat(segments[_SEG_MODIFIER],
                                        DecimalFormatSymbols.getInstance(_locale));
                                } catch (e) {
                                _maxOffset = oldMaxOffset;
                                throw e;
                            }
                                break;
                        }
                        break;

                    case _TYPE_DATE:
                    case _TYPE_TIME:
                        var mod = _findKeyword(segments[_SEG_MODIFIER], _DATE_TIME_MODIFIER_KEYWORDS);
                        if (mod >= 0 && mod < _DATE_TIME_MODIFIER_KEYWORDS.length) {
                            if (type == _TYPE_DATE) {
                                newFormat = DateFormat.getDateInstance(_DATE_TIME_MODIFIERS[mod],
                                    _locale);
                            } else {
                                newFormat = DateFormat.getTimeInstance(_DATE_TIME_MODIFIERS[mod],
                                    _locale);
                            }
                        } else {
                            // SimpleDateFormat pattern
                            try {
                                newFormat = new SimpleDateFormat(segments[_SEG_MODIFIER], _locale);
                            } catch (e) {
                                _maxOffset = oldMaxOffset;
                                throw e;
                            }
                        }
                        break;

                    case _TYPE_CHOICE:
                        try {
                            // ChoiceFormat pattern
                            newFormat = new ChoiceFormat(segments[_SEG_MODIFIER]);
                        } catch (e) {
                        _maxOffset = oldMaxOffset;
                            throw "Choice Pattern incorrect: "
                                + segments[_SEG_MODIFIER];
                        }
                        break;

                    default:
                        _maxOffset = oldMaxOffset;
                        throw "unknown format type: " +
                            segments[_SEG_TYPE];
                }
            }
            _formats[offsetNumber] = newFormat;
        };

        var _subformat = function(arguments, result, fp) {
            fp = fp && fp instanceof FieldPosition ? fp : new FieldPosition( 0 );
            // note: this implementation assumes a fast substring & index.
            // if this is not true, would be better to append chars one by one.
            var lastOffset = 0;
            var last = result.length;
            for (var i = 0; i <= _maxOffset; ++i) {
                result += _pattern.substring(lastOffset, _offsets[i]);
                lastOffset = _offsets[i];
                var argumentNumber = _argumentNumbers[i];
                if (!arguments || argumentNumber >= arguments.length) {
                    result += '{' + argumentNumber + '}';
                    continue;
                }
                // int argRecursion = ((recursionProtection >> (argumentNumber*2)) & 0x3);
                if (false) { // if (argRecursion == 3){
                    // prevent loop!!!
                    result += '\uFFFD';
                } else {
                    var obj = arguments[argumentNumber];
                    var arg = null;
                    var subFormatter = null;
                    if (obj == null || obj == undefined) {
                        arg = "null";
                    } else if (_formats[i]) {
                        subFormatter = _formats[i];
                        if (subFormatter instanceof ChoiceFormat) {
                            arg = _formats[i].format(obj);
                            if (arg.indexOf('{') >= 0) {
                                subFormatter = new MessageFormat(arg, _locale);
                                obj = arguments;
                                arg = null;
                            }
                        }
                    } else if (obj instanceof Number) {
                        // format number if can
                        subFormatter = NumberFormat.getInstance(_locale);
                    } else if (obj instanceof Date) {
                        // format a Date if can
                        subFormatter = DateFormat.getDateTimeInstance(
                            DateFormat.SHORT, DateFormat.SHORT, _locale);//fix
                    } else if (obj instanceof String) {
                        arg = obj;

                    } else {
                        arg = obj.toString();
                        if (arg == null) arg = "null";
                    }

                    // At this point we are in two states, either subFormatter
                    // is non-null indicating we should format obj using it,
                    // or arg is non-null and we should use it as the value.

                    if (subFormatter) {
                        arg = subFormatter.format(obj);
                    }
                    last = result.length;
                    result += arg;
                    if (i == 0 && fp != null && MessageFormat.Field.ARGUMENT == fp.attribute) {
                         fp.beginIndex = last;
                         fp.endIndex = result.length;
                     }
                    last = result.length;
                }
            }
            result += _pattern.substring(lastOffset, _pattern.length);
            return result;
        };

        var _init = function(pattern) {
            _locale = arguments.length > 1 ? arguments[1] : Locale.getDefault();
            _this.applyPattern(pattern);
        };

        this.applyPattern = function(pattern) {
            var segments = new Array(4);
            // Allocate only segments[SEG_RAW] here. The rest are
            // allocated on demand.
            segments[_SEG_RAW] = "";

            var part = _SEG_RAW;
            var formatNumber = 0;
            var inQuote = false;
            var braceStack = 0;
            _maxOffset = -1;
            for (var i = 0; i < pattern.length; ++i) {
                var ch = pattern.charAt(i);
                if (part == _SEG_RAW) {
                    if (ch == '\'') {
                        if (i + 1 < pattern.length
                            && pattern.charAt(i+1) == '\'') {
                            segments[part] += ch;  // handle doubles
                            ++i;
                        } else {
                            inQuote = !inQuote;
                        }
                    } else if (ch == '{' && !inQuote) {
                        part = _SEG_INDEX;
                        if (segments[_SEG_INDEX] == undefined) {
                            segments[_SEG_INDEX] = "";
                        }
                    } else {
                        segments[part] += ch;
                    }
                } else  {
                    if (inQuote) {              // just copy quotes in parts
                        segments[part] += ch;
                        if (ch == '\'') {
                            inQuote = false;
                        }
                    } else {
                        switch (ch) {
                            case ',':
                                if (part < _SEG_MODIFIER) {
                                    if (segments[++part] == undefined) {
                                        segments[part] = "";
                                    }
                                } else {
                                    segments[part] += ch;
                                }
                                break;
                            case '{':
                                ++braceStack;
                                segments[part] += ch;
                                break;
                            case '}':
                                if (braceStack == 0) {
                                    part = _SEG_RAW;
                                    _makeFormat(i, formatNumber, segments);
                                    formatNumber++;
                                    // throw away other segments
                                    segments[_SEG_INDEX] = null;
                                    segments[_SEG_TYPE] = null;
                                    segments[_SEG_MODIFIER] = null;
                                } else {
                                    --braceStack;
                                    segments[part] += ch;
                                }
                                break;
                            case ' ':
                                // Skip any leading space chars for SEG_TYPE.
                                if (part != _SEG_TYPE || segments[_SEG_TYPE].length > 0) {
                                    segments[part] += ch;
                                }
                                break;
                            case '\'':
                                inQuote = true;
                            // fall through, so we keep quotes in other parts
                            default:
                                segments[part] += ch;
                                break;
                        }
                    }
                }
            }
            if (braceStack == 0 && part != 0) {
                _maxOffset = -1;
                throw "Unmatched braces in the pattern.";
            }
            _pattern = segments[0].toString();
        };

        this.toPattern = function() {
            // later, make this more extensible
            var lastOffset = 0;
            var result = "";
            for (var i = 0; i <= _maxOffset; ++i) {
                result = _copyAndFixQuotes(_pattern, lastOffset, _offsets[i], result);
                lastOffset = _offsets[i];
                result += '{' + _argumentNumbers[i];
                var fmt = _formats[i];
                if (!fmt) {
                    // do nothing, string format
                } else if (fmt instanceof NumberFormat) {
                    if (fmt.equals(NumberFormat.getInstance(_locale))) {
                        result += ",number";
                    } else if (fmt.equals(NumberFormat.getCurrencyInstance(_locale))) {
                        result += ",number,currency";
                    } else if (fmt.equals(NumberFormat.getPercentInstance(_locale))) {
                        result += ",number,percent";
                    } else if (fmt.equals(NumberFormat.getIntegerInstance(_locale))) {
                        result += ",number,integer";
                    } else {
                        if (fmt instanceof DecimalFormat) {
                            result += (",number," + fmt.toPattern());
                        } else if (fmt instanceof ChoiceFormat) {
                            result += (",choice," + fmt.toPattern());
                        } else {
                            // UNKNOWN
                        }
                    }
                } else if (fmt instanceof DateFormat) {
                    var index;
                    for (index = _MODIFIER_DEFAULT; index < _DATE_TIME_MODIFIERS.length; index++) {
                        var df = DateFormat.getDateInstance(_DATE_TIME_MODIFIERS[index],
                            _locale);
                        if (fmt.equals(df)) {
                            result += ",date";
                            break;
                        }
                        df = DateFormat.getTimeInstance(_DATE_TIME_MODIFIERS[index],
                            _locale);
                        if (fmt.equals(df)) {
                            result += ",time";
                            break;
                        }
                    }
                    if (index >= _DATE_TIME_MODIFIERS.length) {
                        if (fmt instanceof SimpleDateFormat) {
                            result += (",date," + fmt.toPattern());
                        } else {
                            // UNKNOWN
                        }
                    } else if (index != _MODIFIER_DEFAULT) {
                        result += (',' + _DATE_TIME_MODIFIER_KEYWORDS[index]);
                    }
                } else {
                    //result.append(", unknown");
                }
                result += '}';
            }
            result = _copyAndFixQuotes(_pattern, lastOffset, _pattern.length, result);
            return result.toString();
        };

        this.setLocale = function(locale) {
            _locale = locale;
        };

        this.getLocale = function() {
            return _locale;
        };

        this.setFormatsByArgumentIndex = function(newFormats) {
            for (var i = 0; i <= _maxOffset; i++) {
                var j = _argumentNumbers[i];
                if (j < newFormats.length) {
                    _formats[i] = newFormats[j];
                }
            }
        };

        this.setFormats = function(newFormats) {
            var runsToCopy = newFormats.length;
            if (runsToCopy > _maxOffset + 1) {
                runsToCopy = _maxOffset + 1;
            }
            for (var i = 0; i < runsToCopy; i++) {
                _formats[i] = newFormats[i];
            }
        };

        this.setFormatByArgumentIndex = function(argumentIndex, newFormat) {
            for (var j = 0; j <= _maxOffset; j++) {
                if (_argumentNumbers[j] == argumentIndex) {
                    _formats[j] = newFormat;
                }
            }
        };

        this.setFormat = function(formatElementIndex, newFormat) {
            _formats[formatElementIndex] = newFormat;
        };

        this.getFormatsByArgumentIndex = function() {
            var maximumArgumentNumber = -1;
            var i;
            for (i = 0; i <= _maxOffset; i++) {
                if (_argumentNumbers[i] > maximumArgumentNumber) {
                    maximumArgumentNumber = _argumentNumbers[i];
                }
            }
            var resultArray = new Array(_maxOffset + 1);
            for (i = 0; i <= _maxOffset; i++) {
                resultArray[_argumentNumbers[i]] = _formats[i];
            }
            return resultArray;
        };

        this.getFormats = function() {
            return _formats.slice(0, _maxOffset + 1);
        };

        this.format = function(arguments, result) {
            return _subformat(arguments, result || "");
        };

        this.parse = function(source, pos) {
            pos = pos || new ParsePosition(0);
            if (source == null || source == undefined) {
                var empty = [];
                return empty;
            }

            var i;
            var len;
            var maximumArgumentNumber = -1;
            for (i = 0; i <= _maxOffset; i++) {
                if (_argumentNumbers[i] > maximumArgumentNumber) {
                    maximumArgumentNumber = _argumentNumbers[i];
                }
            }
            var resultArray = new Array(maximumArgumentNumber + 1);

            var patternOffset = 0;
            var sourceOffset = pos.index;
            var tempStatus = new ParsePosition(0);
            for (i = 0; i <= _maxOffset; ++i) {
                // match up to format
                len = _offsets[i] - patternOffset;
                if (len == 0 || pattern.substr(patternOffset, len)
                        .search(source.substring(sourceOffset)) > -1) {
                    sourceOffset += len;
                    patternOffset += len;
                } else {
                    pos.errorIndex = sourceOffset;
                    return null; // leave index as is to signal error
                }

                // now use format
                if (_formats[i] == null) {   // string format
                    // if at end, use longest possible match
                    // otherwise uses first match to intervening string
                    // does NOT recursively try all possibilities
                    var tempLength = (i != _maxOffset) ? _offsets[i+1] : pattern.length;

                    var next;
                    if (patternOffset >= tempLength) {
                        next = source.length;
                    }else{
                        next = source.indexOf(pattern.substring(patternOffset, tempLength),
                            sourceOffset);
                    }

                    if (next < 0) {
                        pos.errorIndex = sourceOffset;
                        return null; // leave index as is to signal error
                    } else {
                        var strValue= source.substring(sourceOffset,next);
                        if (!strValue.equals("{"+_argumentNumbers[i]+"}"))
                            resultArray[_argumentNumbers[i]]
                                = source.substring(sourceOffset,next);
                        sourceOffset = next;
                    }
                } else {
                    tempStatus.index = sourceOffset;
                    resultArray[_argumentNumbers[i]]
                        = _formats[i].parse(source,tempStatus);
                    if (tempStatus.index == sourceOffset) {
                        pos.errorIndex = sourceOffset;
                        return null; // leave index as is to signal error
                    }
                    sourceOffset = tempStatus.index; // update
                }
            }
            len = pattern.length - patternOffset;
            if (len == 0 || pattern.substr(patternOffset, len)
                    .search(source.substring(sourceOffset)) > -1) {
                pos.index = sourceOffset + len;
            } else {
                pos.errorIndex = sourceOffset;
                return null; // leave index as is to signal error
            }
            return resultArray;
        };

        _init.apply(this, Array.prototype.slice.call(arguments));
    };

    var _INITIAL_FORMATS = 10;

    // Indices for segments
    var _SEG_RAW      = 0;
    var _SEG_INDEX    = 1;
    var _SEG_TYPE     = 2;
    var _SEG_MODIFIER = 3; // modifier or subformat

    // Indices for type keywords
    var _TYPE_NULL    = 0;
    var _TYPE_NUMBER  = 1;
    var _TYPE_DATE    = 2;
    var _TYPE_TIME    = 3;
    var _TYPE_CHOICE  = 4;

    var _TYPE_KEYWORDS = [
        "",
        "number",
        "date",
        "time",
        "choice"
    ];

    // Indices for number modifiers
    var _MODIFIER_DEFAULT  = 0; // common in number and date-time
    var _MODIFIER_CURRENCY = 1;
    var _MODIFIER_PERCENT  = 2;
    var _MODIFIER_INTEGER  = 3;

    var _NUMBER_MODIFIER_KEYWORDS = [
        "",
        "currency",
        "percent",
        "integer"
    ];

    // Indices for date-time modifiers
    var _MODIFIER_SHORT   = 1;
    var _MODIFIER_MEDIUM  = 2;
    var _MODIFIER_LONG    = 3;
    var _MODIFIER_FULL    = 4;

    var _DATE_TIME_MODIFIER_KEYWORDS = [
        "",
        "short",
        "medium",
        "long",
        "full"
    ];

    // Date-time style values corresponding to the date-time modifiers.
    var _DATE_TIME_MODIFIERS = [
        DateFormat.DEFAULT,
        DateFormat.SHORT,
        DateFormat.MEDIUM,
        DateFormat.LONG,
        DateFormat.FULL
    ];

    var _findKeyword = function(s, list) {
        var i;
        for (i = 0; i < list.length; ++i) {
            if (s === (list[i]))
                return i;
        }

        // Try trimmed lowercase.
        var ls = s.trim().toLowerCase();
        if (ls != s) {
            for (i = 0; i < list.length; ++i) {
                if (ls === list[i])
                    return i;
            }
        }
        return -1;
    };

    var _copyAndFixQuotes = function(source, start, end, target) {
        var quoted = false;

        for (var i = start; i < end; ++i) {
            var ch = source.charAt(i);
            if (ch == '{') {
                if (!quoted) {
                    target += '\'';
                    quoted = true;
                }
                target += ch;
            } else if (ch == '\'') {
                target += "''";
            } else {
                if (quoted) {
                    target += '\'';
                    quoted = false;
                }
                target += ch;
            }
        }
        if (quoted) {
            target += '\'';
        }
        return target;
    };

    MessageFormat.format = function(pattern) {
        var fmt = new MessageFormat(pattern);
        var args = Array.prototype.slice.call(arguments, 1);
        if (args.length == 1 && Array.isArray(args[0])) {
            args = args[0];
        }
        return fmt.format(args);
    };

    MessageFormat.prototype = Object.create(Format.prototype);

    MessageFormat.prototype.constructor = MessageFormat;

    MessageFormat.Field = function Field(name) {
        Format.Field.call(this, name);
    };

    MessageFormat.Field.prototype = Object.create(Format.Field.prototype);

    MessageFormat.Field.prototype.constructor = MessageFormat.Field;

    MessageFormat.Field.ARGUMENT = new MessageFormat.Field("message argument field");

    global.MessageFormat = MessageFormat;

    return MessageFormat;

});
