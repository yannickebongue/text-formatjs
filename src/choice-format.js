( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.require( "./locale" );
        module.require( "./number-format" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    function ChoiceFormat( newPattern ) {
        var _choiceLimits;
        var _choiceFormats;

        this.applyPattern = function( newPattern ) {
            var segments = [ "", "" ];
            var newChoiceLimits = [];
            var newChoiceFormats = [];
            var count = 0;
            var part = 0;
            var startValue = 0;
            var oldStartValue = Number.NaN;
            var inQuote = false;
            for ( var i = 0; i < newPattern.length; ++i ) {
                var ch = newPattern.charAt( i );
                if ( ch == "'" ) {
                    // Check for "''" indicating a literal quote
                    if ( ( i + 1 ) < newPattern.length && newPattern.charAt( i + 1 ) == ch ) {
                        segments[ part ] += ch;
                        ++i;
                    } else {
                        inQuote = !inQuote;
                    }
                } else if ( inQuote ) {
                    segments[ part ] += ch;
                } else if ( ch == "<" || ch == "#" || ch == "\u2264" ) {
                    if (segments[ 0 ].length == 0) {
                        throw "";
                    }
                    try {
                        var tempBuffer = segments[ 0 ].toString();
                        if ( tempBuffer === "\u221E" ) {
                            startValue = Number.POSITIVE_INFINITY;
                        } else if ( tempBuffer === "-\u221E" ) {
                            startValue = Number.NEGATIVE_INFINITY;
                        } else {
                            startValue = parseFloat( segments[ 0 ] );
                        }
                    } catch ( e ) {
                        throw "";
                    }
                    if ( ch == "<" && startValue != Number.POSITIVE_INFINITY &&
                        startValue != Number.NEGATIVE_INFINITY ) {
                        startValue = ChoiceFormat.nextDouble( startValue );
                    }
                    if ( startValue <= oldStartValue ) {
                        throw "";
                    }
                    segments[ 0 ] = "";
                    part = 1;
                } else if ( ch == "|" ) {
                    newChoiceLimits.push( startValue );
                    newChoiceFormats.push( segments[ 1 ].toString() );
                    ++count;
                    oldStartValue = startValue;
                    segments[ 1 ] = "";
                    part = 0;
                } else {
                    segments[ part ] += ch;
                }
            }
            // clean up last one
            if ( part == 1 ) {
                newChoiceLimits.push( startValue );
                newChoiceFormats.push( segments[ 1 ].toString() );
                ++count;
            }
            _choiceLimits = newChoiceLimits.slice( 0, count );
            _choiceFormats = newChoiceFormats.slice( 0, count );
        };

        this.toPattern = function() {
            var result = "";
            for (var i = 0; i < _choiceLimits.length; ++i) {
                if ( i != 0 ) {
                    result += "|";
                }
                // choose based upon which has less precision
                // approximate that by choosing the closest one to an integer.
                // could do better, but it's not worth it.
                var less = ChoiceFormat.previousDouble( _choiceLimits[ i ] );
                var tryLessOrEqual = Math.abs( ( _choiceLimits[i] % 1.0 ) );
                var tryLess = Math.abs( ( less % 1.0 ) );

                if ( tryLessOrEqual < tryLess ) {
                    result += _choiceLimits[ i ].toString();
                    result += "#";
                } else {
                    if ( _choiceLimits[ i ] == Number.POSITIVE_INFINITY ) {
                        result += "\u221E";
                    } else if ( _choiceLimits[ i ] == Number.NEGATIVE_INFINITY ) {
                        result += "-\u221E";
                    } else {
                        result += less.toString();
                    }
                    result += "<";
                }
                // Append choiceFormats[i], using quotes if there are special characters.
                // Single quotes themselves must be escaped in either case.
                var text = _choiceFormats[ i ];
                var needQuote = text.indexOf( "<" ) >= 0
                    || text.indexOf( "#" ) >= 0
                    || text.indexOf( "\u2264" ) >= 0
                    || text.indexOf( "|" ) >= 0;
                if ( needQuote ) result += "'";
                if ( text.indexOf("'") < 0 ) result += text;
                else {
                    for ( var j = 0; j < text.length; ++j ) {
                        var c = text.charAt( j );
                        result += c;
                        if ( c == "'") result += c;
                    }
                }
                if ( needQuote ) result += "'";
            }
            return result.toString();
        };

        this.setChoices = function( limits, formats ) {
            if ( limits.length != formats.length ) {
                throw "Array and limit arrays must be of the same length.";
            }
            _choiceLimits = limits;
            _choiceFormats = formats;
        };

        this.getLimits = function() {
            return _choiceLimits;
        };

        this.getFormats = function() {
            return _choiceFormats;
        };

        this.format = function( number ) {
            // find the number
            var i;
            for ( i = 0; i < _choiceLimits.length; ++i ) {
                if ( !( number >= _choiceLimits[ i ] ) ) {
                    // same as number < choiceLimits, except catchs NaN
                    break;
                }
            }
            --i;
            if ( i < 0 ) i = 0;
            // return either a formatted number, or a string
            return _choiceFormats[ i ];
        };

        this.parse = function( text ) {
            // find the best number (defined as the one with the longest parse)
            var status = new global.ParsePosition( 0 );
            var start = status.index;
            var furthest = start;
            var bestNumber = Number.NaN;
            var tempNumber = 0.0;
            for ( var i = 0; i < _choiceFormats.length; ++i ) {
                var tempString = _choiceFormats[ i ];
                if ( text.substr( start, tempString.length ).search( tempString ) > -1 ) {
                    status.index = start + tempString.length;
                    tempNumber = _choiceLimits[ i ];
                    if ( status.index > furthest ) {
                        furthest = status.index;
                        bestNumber = tempNumber;
                        if ( furthest == text.length ) break;
                    }
                }
            }
            status.index = furthest;
            if ( status.index == start ) {
                status.errorIndex = furthest;
            }
            return bestNumber;
        };

        if ( arguments.length == 2 ) {
            this.setChoices.apply( this, arguments.slice() );
        } else {
            this.applyPattern( newPattern );
        }
    }

    var _SIGN                = 0x8000000000000000;
    var _EXPONENT            = 0x7FF0000000000000;
    var _POSITIVEINFINITY    = 0x7FF0000000000000;

    ChoiceFormat.previousDouble = function( d ) {
        return ChoiceFormat.nextDouble( d, false );
    };

    ChoiceFormat.nextDouble = function( d, positive ) {
        if ( typeof positive == "undefined" ) {
            return ChoiceFormat.nextDouble( d, true );
        }

        /* filter out NaN's */
        if ( isNaN( d ) ) {
            return d;
        }

        /* zero's are also a special case */
        if ( d == 0.0 ) {
            var smallestPositiveDouble = Number.MIN_VALUE;
            if ( positive ) {
                return smallestPositiveDouble;
            } else {
                return -smallestPositiveDouble;
            }
        }

        /* if entering here, d is a nonzero value */
        return d + ( ( positive ? 1 : -1 ) * 1e-15 );
    };

    global.ChoiceFormat = ChoiceFormat;

    return ChoiceFormat;

} ) );
