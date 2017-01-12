( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.require( "./locale" );
        module.require( "./number-format" );
        module.require( "./decimal-format-symbols" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    function DecimalFormat( pattern, symbols ) {
        global.NumberFormat.call( this );
        var _super = this;

        var _PATTERN_ZERO_DIGIT         = "0";
        var _PATTERN_GROUPING_SEPARATOR = ",";
        var _PATTERN_DECIMAL_SEPARATOR  = ".";
        var _PATTERN_PER_MILLE          = "\u2030";
        var _PATTERN_PERCENT            = "%";
        var _PATTERN_DIGIT              = "#";
        var _PATTERN_SEPARATOR          = ";";
        var _PATTERN_EXPONENT           = "E";
        var _PATTERN_MINUS              = "-";

        var _CURRENCY_SIGN = "\u00A4";
        var _QUOTE = "'";

        var _MAXIMUM_INTEGER_DIGITS = 0x7fffffff;
        var _MAXIMUM_FRACTION_DIGITS = 0x7fffffff;

        var _digitList = new global.DigitList();
        var _positivePrefix = "";
        var _positiveSuffix = "";
        var _negativePrefix = "-";
        var _negativeSuffix = "";
        var _posPrefixPattern;
        var _posSuffixPattern;
        var _negPrefixPattern;
        var _negSuffixPattern;
        var _symbols;
        var _multiplier = 1;
        var _groupingSize = 3;
        var _decimalSeparatorAlwaysShown = false;
        var _isCurrencyFormat = false;
        var _useExponentialNotation = false;
        var _minExponentDigits;

        var _expandAffixes = function() {
            if ( _posPrefixPattern != null ) {
                _positivePrefix = _expandAffix( _posPrefixPattern );
            }
            if ( _posSuffixPattern != null ) {
                _positiveSuffix = _expandAffix( _posSuffixPattern );
            }
            if ( _negPrefixPattern != null ) {
                _negativePrefix = _expandAffix( _negPrefixPattern );
            }
            if ( _negSuffixPattern != null ) {
                _negativeSuffix = _expandAffix( _negSuffixPattern );
            }
        };

        var _expandAffix = function( pattern ) {
            var buffer = "";
            for ( var i = 0; i < pattern.length; ) {
                var c = pattern.charAt( i++ );
                if ( c === _QUOTE ) {
                    c = pattern.charAt( i++ );
                    switch ( c ) {
                    case _CURRENCY_SIGN:
                        if ( i < pattern.length &&
                            pattern.charAt( i ) === _CURRENCY_SIGN ) {
                            ++i;
                            buffer += _symbols.getInternationalCurrencySymbol();
                        } else {
                            buffer += _symbols.getCurrencySymbol();
                        }
                        continue;
                    case _PATTERN_PERCENT:
                        c = _symbols.getPercent();
                        break;
                    case _PATTERN_PER_MILLE:
                        c = _symbols.getPerMill();
                        break;
                    case _PATTERN_MINUS:
                        c = _symbols.getMinusSign();
                        break;
                    }
                }
                buffer += c;
            }
            return buffer;
        };

        var _append = function( result, string ) {
            if ( string.length > 0 ) {
                result += string;
            }
            return result;
        };

        var _applyPattern = function( pattern, localized ) {
            var zeroDigit         = _PATTERN_ZERO_DIGIT;
            var groupingSeparator = _PATTERN_GROUPING_SEPARATOR;
            var decimalSeparator  = _PATTERN_DECIMAL_SEPARATOR;
            var percent           = _PATTERN_PERCENT;
            var perMill           = _PATTERN_PER_MILLE;
            var digit             = _PATTERN_DIGIT;
            var separator         = _PATTERN_SEPARATOR;
            var exponent          = _PATTERN_EXPONENT;
            var minus             = _PATTERN_MINUS;
            if ( localized ) {
                zeroDigit         = _symbols.getZeroDigit();
                groupingSeparator = _symbols.getGroupingSeparator();
                decimalSeparator  = _symbols.getDecimalSeparator();
                percent           = _symbols.getPercent();
                perMill           = _symbols.getPerMill();
                digit             = _symbols.getDigit();
                separator         = _symbols.getPatternSeparator();
                exponent          = _symbols.getExponentSeparator();
                minus             = _symbols.getMinusSign();
            }
            var gotNegative = false;
            _decimalSeparatorAlwaysShown = false;
            _isCurrencyFormat = false;
            _useExponentialNotation = false;

            // Two variables are used to record the subrange of the pattern
            // occupied by phase 1.  This is used during the processing of the
            // second pattern (the one representing negative numbers) to ensure
            // that no deviation exists in phase 1 between the two patterns.
            var phaseOneStart = 0;
            var phaseOneLength = 0;

            var start = 0;
            for ( var j = 1; j >= 0 && start < pattern.length; --j ) {
                var inQuote = false;
                var prefix = "";
                var suffix = "";
                var decimalPos = -1;
                var multiplier = 1;
                var digitLeftCount = 0, zeroDigitCount = 0, digitRightCount = 0;
                var groupingCount = -1;

                // The phase ranges from 0 to 2.  Phase 0 is the prefix.  Phase 1 is
                // the section of the pattern with digits, decimal separator,
                // grouping characters.  Phase 2 is the suffix.  In phases 0 and 2,
                // percent, per mille, and currency symbols are recognized and
                // translated.  The separation of the characters into phases is
                // strictly enforced; if phase 1 characters are to appear in the
                // suffix, for example, they must be quoted.
                var phase = 0;

                // The affix is either the prefix or the suffix.
                var affixes = [];
                var affix = prefix;

                for ( var pos = start; pos < pattern.length; ++pos ) {
                    var ch = pattern.charAt( pos );
                    switch ( phase ) {
                    case 0:
                    case 2:
                        // Process the prefix / suffix characters
                        if ( inQuote ) {
                            // A quote within quotes indicates either the closing
                            // quote or two quotes, which is a quote literal. That
                            // is, we have the second quote in 'do' or 'don''t'.
                            if ( ch == _QUOTE ) {
                                if ( ( pos + 1 ) < pattern.length &&
                                    pattern.charAt( pos + 1 ) == _QUOTE) {
                                    ++pos;
                                    affix += "''"; // 'don''t'
                                } else {
                                    inQuote = false; // 'do'
                                }
                                continue;
                            }
                        } else {
                            // Process unquoted characters seen in prefix or suffix
                            // phase.
                            if (ch == digit ||
                                ch == zeroDigit ||
                                ch == groupingSeparator ||
                                ch == decimalSeparator) {
                                phase = 1;
                                if ( j == 1 ) {
                                    phaseOneStart = pos;
                                }
                                --pos; // Reprocess this character
                                continue;
                            } else if (ch == _CURRENCY_SIGN) {
                                // Use lookahead to determine if the currency sign
                                // is doubled or not.
                                var doubled = ( pos + 1 ) < pattern.length &&
                                    pattern.charAt( pos + 1 ) == _CURRENCY_SIGN;
                                if (doubled) { // Skip over the doubled character
                                    ++pos;
                                }
                                _isCurrencyFormat = true;
                                affix += (doubled ? "'\u00A4\u00A4" : "'\u00A4");
                                continue;
                            } else if (ch == _QUOTE) {
                                // A quote outside quotes indicates either the
                                // opening quote or two quotes, which is a quote
                                // literal. That is, we have the first quote in 'do'
                                // or o''clock.
                                if (ch == _QUOTE) {
                                    if ((pos+1) < pattern.length &&
                                        pattern.charAt( pos + 1 ) == _QUOTE) {
                                        ++pos;
                                        affix += "''"; // o''clock
                                    } else {
                                        inQuote = true; // 'do'
                                    }
                                    continue;
                                }
                            } else if (ch == separator) {
                                // Don't allow separators before we see digit
                                // characters of phase 1, and don't allow separators
                                // in the second pattern (j == 0).
                                if (phase == 0 || j == 0) {
                                    throw "Unquoted special character '" +
                                        ch + "' in pattern \"" + pattern + "\"";
                                }
                                start = pos + 1;
                                pos = pattern.length;
                                continue;
                            }

                            // Next handle characters which are appended directly.
                            else if (ch == percent) {
                                if (multiplier != 1) {
                                    throw "Too many percent/per mille characters in pattern \"" +
                                        pattern + "\"";
                                }
                                multiplier = 100;
                                affix += "'%";
                                continue;
                            } else if (ch == perMill) {
                                if (multiplier != 1) {
                                    throw "Too many percent/per mille characters in pattern \"" +
                                        pattern + "\"";
                                }
                                multiplier = 1000;
                                affix += "'\u2030";
                                continue;
                            } else if (ch == minus) {
                                affix += "'-";
                                continue;
                            }
                        }
                        // Note that if we are within quotes, or if this is an
                        // unquoted, non-special character, then we usually fall
                        // through to here.
                        affix += ch;
                        break;

                    case 1:
                        // Phase one must be identical in the two sub-patterns. We
                        // enforce this by doing a direct comparison. While
                        // processing the first sub-pattern, we just record its
                        // length. While processing the second, we compare
                        // characters.
                        if (j == 1) {
                            ++phaseOneLength;
                        } else {
                            if (--phaseOneLength == 0) {
                                phase = 2;
                                affixes.push(affix);
                                affix = suffix;
                            }
                            continue;
                        }

                        // Process the digits, decimal, and grouping characters. We
                        // record five pieces of information. We expect the digits
                        // to occur in the pattern ####0000.####, and we record the
                        // number of left digits, zero (central) digits, and right
                        // digits. The position of the last grouping character is
                        // recorded (should be somewhere within the first two blocks
                        // of characters), as is the position of the decimal point,
                        // if any (should be in the zero digits). If there is no
                        // decimal point, then there should be no right digits.
                        if (ch == digit) {
                            if (zeroDigitCount > 0) {
                                ++digitRightCount;
                            } else {
                                ++digitLeftCount;
                            }
                            if (groupingCount >= 0 && decimalPos < 0) {
                                ++groupingCount;
                            }
                        } else if (ch == zeroDigit) {
                            if (digitRightCount > 0) {
                                throw "Unexpected '0' in pattern \"" +
                                    pattern + "\"";
                            }
                            ++zeroDigitCount;
                            if (groupingCount >= 0 && decimalPos < 0) {
                                ++groupingCount;
                            }
                        } else if (ch == groupingSeparator) {
                            groupingCount = 0;
                        } else if (ch == decimalSeparator) {
                            if (decimalPos >= 0) {
                                throw "Multiple decimal separators in pattern \"" +
                                    pattern + "\"";
                            }
                            decimalPos = digitLeftCount + zeroDigitCount + digitRightCount;
                        } else if (pattern.substr(pos, exponent.length).search(exponent) > -1){
                            if (_useExponentialNotation) {
                                throw "Multiple exponential " +
                                    "symbols in pattern \"" + pattern + "\"";
                            }
                            _useExponentialNotation = true;
                            _minExponentDigits = 0;

                            // Use lookahead to parse out the exponential part
                            // of the pattern, then jump into phase 2.
                            pos = pos + exponent.length;
                            while (pos < pattern.length &&
                            pattern.charAt( pos ) == zeroDigit) {
                                ++_minExponentDigits;
                                ++phaseOneLength;
                                ++pos;
                            }

                            if ((digitLeftCount + zeroDigitCount) < 1 ||
                                _minExponentDigits < 1) {
                                throw "Malformed exponential " +
                                    "pattern \"" + pattern + "\"";
                            }

                            // Transition to phase 2
                            phase = 2;
                            affixes.push(affix);
                            affix = suffix;
                            --pos;
                            continue;
                        } else {
                            phase = 2;
                            affixes.push(affix);
                            affix = suffix;
                            --pos;
                            --phaseOneLength;
                            continue;
                        }
                        break;
                    }
                }
                affixes.push(affix);
                if (affixes.length > 0) {
                    prefix = affixes[0];
                }
                if (affixes.length > 1) {
                    suffix = affixes[1];
                }

                // Handle patterns with no '0' pattern character. These patterns
                // are legal, but must be interpreted.  "##.###" -> "#0.###".
                // ".###" -> ".0##".
                /* We allow patterns of the form "####" to produce a zeroDigitCount
                 * of zero (got that?); although this seems like it might make it
                 * possible for format() to produce empty strings, format() checks
                 * for this condition and outputs a zero digit in this situation.
                 * Having a zeroDigitCount of zero yields a minimum integer digits
                 * of zero, which allows proper round-trip patterns.  That is, we
                 * don't want "#" to become "#0" when toPattern() is called (even
                 * though that's what it really is, semantically).
                 */
                if (zeroDigitCount == 0 && digitLeftCount > 0 && decimalPos >= 0) {
                    // Handle "###.###" and "###." and ".###"
                    var n = decimalPos;
                    if (n == 0) { // Handle ".###"
                        ++n;
                    }
                    digitRightCount = digitLeftCount - n;
                    digitLeftCount = n - 1;
                    zeroDigitCount = 1;
                }

                // Do syntax checking on the digits.
                if ((decimalPos < 0 && digitRightCount > 0) ||
                    (decimalPos >= 0 && (decimalPos < digitLeftCount ||
                    decimalPos > (digitLeftCount + zeroDigitCount))) ||
                    groupingCount == 0 || inQuote) {
                    throw "Malformed pattern \"" +
                        pattern + "\"";
                }

                if (j == 1) {
                    _posPrefixPattern = prefix.toString();
                    _posSuffixPattern = suffix.toString();
                    _negPrefixPattern = _posPrefixPattern;   // assume these for now
                    _negSuffixPattern = _posSuffixPattern;
                    var digitTotalCount = digitLeftCount + zeroDigitCount + digitRightCount;
                    /* The effectiveDecimalPos is the position the decimal is at or
                     * would be at if there is no decimal. Note that if decimalPos<0,
                     * then digitTotalCount == digitLeftCount + zeroDigitCount.
                     */
                    var effectiveDecimalPos = decimalPos >= 0 ?
                        decimalPos : digitTotalCount;
                    this.setMinimumIntegerDigits(effectiveDecimalPos - digitLeftCount);
                    this.setMaximumIntegerDigits(_useExponentialNotation ?
                        digitLeftCount + this.getMinimumIntegerDigits() :
                        _MAXIMUM_INTEGER_DIGITS);
                    this.setMaximumFractionDigits(decimalPos >= 0 ?
                        (digitTotalCount - decimalPos) : 0);
                    this.setMinimumFractionDigits(decimalPos >= 0 ?
                        (digitLeftCount + zeroDigitCount - decimalPos) : 0);
                    this.setGroupingUsed(groupingCount > 0);
                    _groupingSize = (groupingCount > 0) ? groupingCount : 0;
                    _multiplier = multiplier;
                    this.setDecimalSeparatorAlwaysShown(decimalPos == 0 ||
                        decimalPos == digitTotalCount);
                } else {
                    _negPrefixPattern = prefix.toString();
                    _negSuffixPattern = suffix.toString();
                    gotNegative = true;
                }
            }

            if (pattern.length == 0) {
                _posPrefixPattern = _posSuffixPattern = "";
                this.setMinimumIntegerDigits(0);
                this.setMaximumIntegerDigits(_MAXIMUM_INTEGER_DIGITS);
                this.setMinimumFractionDigits(0);
                this.setMaximumFractionDigits(_MAXIMUM_FRACTION_DIGITS);
            }

            // If there was no negative pattern, or if the negative pattern is
            // identical to the positive pattern, then prepend the minus sign to
            // the positive pattern to form the negative pattern.
            if (!gotNegative ||
                (_negPrefixPattern === _posPrefixPattern
                && _negSuffixPattern === _posSuffixPattern)) {
                _negSuffixPattern = _posSuffixPattern;
                _negPrefixPattern = "'-" + _posPrefixPattern;
            }

            _expandAffixes();
        };

        var _init = function( pattern, symbols ) {
            var locale = global.Locale.getDefault();

            if ( !pattern ) {
                var rb = global.ResourceBundle.getBundle( "FormatData", locale );
                var all = rb[ "NumberPatterns" ];
                pattern = all[ 0 ];
            }

            if ( symbols && symbols instanceof global.DecimalFormatSymbols ) {
                _symbols = symbols;
            } else {
                _symbols = new global.DecimalFormatSymbols( locale );
            }

            _applyPattern.call( this, pattern, false );
        };

        var _subformat = function( result, isNegative, isInteger,
                                   maxIntDigits, minIntDigits, maxFraDigits, minFraDigits ) {
            // NOTE: This isn't required anymore because DigitList takes care of this.
            //
            //  // The negative of the exponent represents the number of leading
            //  // zeros between the decimal and the first non-zero digit, for
            //  // a value < 0.1 (e.g., for 0.00123, -fExponent == 2).  If this
            //  // is more than the maximum fraction digits, then we have an underflow
            //  // for the printed representation.  We recognize this here and set
            //  // the DigitList representation to zero in this situation.
            //
            //  if (-digitList.decimalAt >= getMaximumFractionDigits())
            //  {
            //      digitList.count = 0;
            //  }

            var zero = _symbols.getZeroDigit();
            var zeroDelta = parseInt(zero, 10); // '0' is the DigitList representation of zero
            var grouping = _symbols.getGroupingSeparator();
            var decimal = _isCurrencyFormat ?
                _symbols.getMonetaryDecimalSeparator() :
                _symbols.getDecimalSeparator();

            /* Per bug 4147706, DecimalFormat must respect the sign of numbers which
             * format as zero.  This allows sensible computations and preserves
             * relations such as signum(1/x) = signum(x), where x is +Infinity or
             * -Infinity.  Prior to this fix, we always formatted zero values as if
             * they were positive.  Liu 7/6/98.
             */
            if (_digitList.isZero()) {
                _digitList.decimalAt = 0; // Normalize
            }

            if (isNegative) {
                result = _append(result, _negativePrefix);
            } else {
                result = _append(result, _positivePrefix);
            }

            if (_useExponentialNotation) {
                // var iFieldStart = result.length;
                // var iFieldEnd = -1;
                // var fFieldStart = -1;

                // Minimum integer digits are handled in exponential format by
                // adjusting the exponent.  For example, 0.01234 with 3 minimum
                // integer digits is "123.4E-4".

                // Maximum integer digits are interpreted as indicating the
                // repeating range.  This is useful for engineering notation, in
                // which the exponent is restricted to a multiple of 3.  For
                // example, 0.01234 with 3 maximum integer digits is "12.34e-3".
                // If maximum integer digits are > 1 and are larger than
                // minimum integer digits, then minimum integer digits are
                // ignored.
                var exponent = _digitList.decimalAt;
                var repeat = maxIntDigits;
                var minimumIntegerDigits = minIntDigits;
                if (repeat > 1 && repeat > minIntDigits) {
                    // A repeating range is defined; adjust to it as follows.
                    // If repeat == 3, we have 6,5,4=>3; 3,2,1=>0; 0,-1,-2=>-3;
                    // -3,-4,-5=>-6, etc. This takes into account that the
                    // exponent we have here is off by one from what we expect;
                    // it is for the format 0.MMMMMx10^n.
                    if (exponent >= 1) {
                        exponent = ((exponent - 1) / repeat) * repeat;
                    } else {
                        // integer division rounds towards 0
                        exponent = ((exponent - repeat) / repeat) * repeat;
                    }
                    minimumIntegerDigits = 1;
                } else {
                    // No repeating range is defined; use minimum integer digits.
                    exponent -= minimumIntegerDigits;
                }

                // We now output a minimum number of digits, and more if there
                // are more digits, up to the maximum number of digits.  We
                // place the decimal point after the "integer" digits, which
                // are the first (decimalAt - exponent) digits.
                var minimumDigits = minIntDigits + minFraDigits;
                if (minimumDigits < 0) {    // overflow?
                    minimumDigits = 0x7fffffff;
                }

                // The number of integer digits is handled specially if the number
                // is zero, since then there may be no digits.
                var integerDigits = _digitList.isZero() ? minimumIntegerDigits :
                    _digitList.decimalAt - exponent;
                if (minimumDigits < integerDigits) {
                    minimumDigits = integerDigits;
                }
                var totalDigits = _digitList.count;
                if (minimumDigits > totalDigits) {
                    totalDigits = minimumDigits;
                }
                // var addedDecimalSeparator = false;

                for (var i=0; i<totalDigits; ++i) {
                    if (i == integerDigits) {
                        // Record field information for caller.
                        // iFieldEnd = result.length;

                        result += decimal;
                        // addedDecimalSeparator = true;

                        // Record field information for caller.
                        // fFieldStart = result.length;
                    }
                    result += (i < _digitList.count) ?
                        (parseInt(_digitList.digits[i], 10) + zeroDelta).toString() :
                        zero;
                }

                if (_decimalSeparatorAlwaysShown && totalDigits == integerDigits) {
                    // Record field information for caller.
                    // iFieldEnd = result.length;

                    result += decimal;
                    // addedDecimalSeparator = true;

                    // Record field information for caller.
                    // fFieldStart = result.length;
                }

                // Record field information
                /*if (iFieldEnd == -1) {
                    iFieldEnd = result.length;
                }*/
                /*delegate.formatted(INTEGER_FIELD, Field.INTEGER, Field.INTEGER,
                    iFieldStart, iFieldEnd, result);
                if (addedDecimalSeparator) {
                    delegate.formatted(Field.DECIMAL_SEPARATOR,
                        Field.DECIMAL_SEPARATOR,
                        iFieldEnd, fFieldStart, result);
                }*/
                /*if (fFieldStart == -1) {
                    fFieldStart = result.length;
                }*/
                /*delegate.formatted(FRACTION_FIELD, Field.FRACTION, Field.FRACTION,
                    fFieldStart, result.length, result);*/

                // The exponent is output using the pattern-specified minimum
                // exponent digits.  There is no maximum limit to the exponent
                // digits, since truncating the exponent would result in an
                // unacceptable inaccuracy.
                // var fieldStart = result.length;

                result += _symbols.getExponentSeparator();

                /*delegate.formatted(Field.EXPONENT_SYMBOL, Field.EXPONENT_SYMBOL,
                    fieldStart, result.length(), result);*/

                // For zero values, we force the exponent to zero.  We
                // must do this here, and not earlier, because the value
                // is used to determine integer digit count above.
                if (_digitList.isZero()) {
                    exponent = 0;
                }

                var negativeExponent = exponent < 0;
                if (negativeExponent) {
                    exponent = -exponent;
                    // fieldStart = result.length;
                    result += _symbols.getMinusSign();
                    /*delegate.formatted(Field.EXPONENT_SIGN, Field.EXPONENT_SIGN,
                        fieldStart, result.length(), result);*/
                }
                _digitList.set(negativeExponent, exponent.toString(), 0, true);

                // var eFieldStart = result.length;

                for (var i=_digitList.decimalAt; i<_minExponentDigits; ++i) {
                    result += zero;
                }
                for (var i=0; i<_digitList.decimalAt; ++i) {
                    result += (i < _digitList.count) ?
                        (parseInt(_digitList.digits[i], 10) + zeroDelta).toString() : zero;
                }
                /*delegate.formatted(Field.EXPONENT, Field.EXPONENT, eFieldStart,
                    result.length(), result);*/
            } else {
                // var iFieldStart = result.length;

                // Output the integer portion.  Here 'count' is the total
                // number of integer digits we will display, including both
                // leading zeros required to satisfy getMinimumIntegerDigits,
                // and actual digits present in the number.
                var count = minIntDigits;
                var digitIndex = 0; // Index into digitList.fDigits[]
                if (_digitList.decimalAt > 0 && count < _digitList.decimalAt) {
                    count = _digitList.decimalAt;
                }

                // Handle the case where getMaximumIntegerDigits() is smaller
                // than the real number of integer digits.  If this is so, we
                // output the least significant max integer digits.  For example,
                // the value 1997 printed with 2 max integer digits is just "97".
                if (count > maxIntDigits) {
                    count = maxIntDigits;
                    digitIndex = _digitList.decimalAt - count;
                }

                var sizeBeforeIntegerPart = result.length;
                for (var i=count-1; i>=0; --i) {
                    if (i < _digitList.decimalAt && digitIndex < _digitList.count) {
                        // Output a real digit
                        result += (parseInt(_digitList.digits[digitIndex++], 10) + zeroDelta).toString();
                    } else {
                        // Output a leading zero
                        result += zero;
                    }

                    // Output grouping separator if necessary.  Don't output a
                    // grouping separator if i==0 though; that's at the end of
                    // the integer part.
                    if (this.isGroupingUsed() && i>0 && (_groupingSize != 0) &&
                        (i % _groupingSize == 0)) {
                        // var gStart = result.length;
                        result += grouping;
                        /*delegate.formatted(Field.GROUPING_SEPARATOR,
                            Field.GROUPING_SEPARATOR, gStart,
                            result.length(), result);*/
                    }
                }

                // Determine whether or not there are any printable fractional
                // digits.  If we've used up the digits we know there aren't.
                var fractionPresent = (minFraDigits > 0) ||
                    (!isInteger && digitIndex < _digitList.count);

                // If there is no fraction present, and we haven't printed any
                // integer digits, then print a zero.  Otherwise we won't print
                // _any_ digits, and we won't be able to parse this string.
                if (!fractionPresent && result.length == sizeBeforeIntegerPart) {
                    result += zero;
                }

                /*delegate.formatted(INTEGER_FIELD, Field.INTEGER, Field.INTEGER,
                    iFieldStart, result.length(), result);*/

                // Output the decimal separator if we always do so.
                // var sStart = result.length;
                if (_decimalSeparatorAlwaysShown || fractionPresent) {
                    result += decimal;
                }

                /*if (sStart != result.length) {
                    delegate.formatted(Field.DECIMAL_SEPARATOR,
                        Field.DECIMAL_SEPARATOR,
                        sStart, result.length(), result);
                }*/
                // var fFieldStart = result.length;

                for (var i=0; i < maxFraDigits; ++i) {
                    // Here is where we escape from the loop.  We escape if we've
                    // output the maximum fraction digits (specified in the for
                    // expression above).
                    // We also stop when we've output the minimum digits and either:
                    // we have an integer, so there is no fractional stuff to
                    // display, or we're out of significant digits.
                    if (i >= minFraDigits &&
                        (isInteger || digitIndex >= _digitList.count)) {
                        break;
                    }

                    // Output leading fractional zeros. These are zeros that come
                    // after the decimal but before any significant digits. These
                    // are only output if abs(number being formatted) < 1.0.
                    if (-1-i > (_digitList.decimalAt-1)) {
                        result += zero;
                        continue;
                    }

                    // Output a digit, if we have any precision left, or a
                    // zero if we don't.  We don't want to output noise digits.
                    if (!isInteger && digitIndex < _digitList.count) {
                        result += (parseInt(_digitList.digits[digitIndex++], 10) + zeroDelta).toString();
                    } else {
                        result += zero;
                    }
                }

                // Record field information for caller.
                /*delegate.formatted(FRACTION_FIELD, Field.FRACTION, Field.FRACTION,
                    fFieldStart, result.length(), result);*/
            }

            if (isNegative) {
                result = _append(result, _negativeSuffix);
            }
            else {
                result = _append(result, _positiveSuffix);
            }

            return result;
        };

        this.getDecimalFormatSymbols = function() {
            return _symbols;
        };

        this.setDecimalFormatSymbols = function( decimalFormatSymbols ) {
            _symbols = decimalFormatSymbols;
        };

        this.getMultiplier = function() {
            return _multiplier;
        };

        this.setMultiplier = function( multiplier ) {
            _multiplier = multiplier;
        };

        this.getGroupingSize = function() {
            return _groupingSize;
        };

        this.setGroupingSize = function( groupingSize ) {
            _groupingSize = groupingSize;
        };

        this.isDecimalSeparatorAlwaysShown = function() {
            return _decimalSeparatorAlwaysShown;
        };

        this.setDecimalSeparatorAlwaysShown = function( decimalSeparatorAlwaysShown ) {
            _decimalSeparatorAlwaysShown = decimalSeparatorAlwaysShown;
        };

        this.format = function( number ) {
            var result = "";
            if (isNaN(number) ||
                (!isFinite(number) && _multiplier == 0)) {
                result += _symbols.getNaN();
                return result;
            }

            /* Detecting whether a double is negative is easy with the exception of
             * the value -0.0.  This is a double which has a zero mantissa (and
             * exponent), but a negative sign bit.  It is semantically distinct from
             * a zero with a positive sign bit, and this distinction is important
             * to certain kinds of computations.  However, it's a little tricky to
             * detect, since (-0.0 == 0.0) and !(-0.0 < 0.0).  How then, you may
             * ask, does it behave distinctly from +0.0?  Well, 1/(-0.0) ==
             * -Infinity.  Proper detection of -0.0 is needed to deal with the
             * issues raised by bugs 4106658, 4106667, and 4147706.  Liu 7/6/98.
             */
            var isNegative = ((number < 0.0) || (number == 0.0 && 1/number < 0.0)) ^ (_multiplier < 0);

            if (_multiplier != 1) {
                number *= _multiplier;
            }

            if (!isFinite(number)) {
                if (isNegative) {
                    result = _append(result, _negativePrefix);
                } else {
                    result = _append(result, _positivePrefix);
                }

                result += _symbols.getInfinity();

                if (isNegative) {
                    result = _append(result, _negativeSuffix);
                } else {
                    result = _append(result, _positiveSuffix);
                }

                return result;
            }

            if (isNegative) {
                number = -number;
            }

            var maxIntDigits = _super.getMaximumIntegerDigits.call( this );
            var minIntDigits = _super.getMinimumIntegerDigits.call( this );
            var maxFraDigits = _super.getMaximumFractionDigits.call( this );
            var minFraDigits = _super.getMinimumFractionDigits.call( this );

            _digitList.set(isNegative, number.toString(),
                _useExponentialNotation ? maxIntDigits + maxFraDigits : maxFraDigits,
                !_useExponentialNotation);
            return _subformat.apply(this, [result, isNegative, false,
                maxIntDigits, minIntDigits, maxFraDigits, minFraDigits]);

        };

        this.parse = function( source ) {};

        this.applyPattern = function( pattern ) {
            _applyPattern.call( this, pattern, false );
        };

        this.applyLocalizedPattern = function( pattern ) {
            _applyPattern.call( this, pattern, true );
        };

        _init.call( this, pattern, symbols );
    }

    DecimalFormat.prototype = Object.create( global.NumberFormat.prototype );

    DecimalFormat.prototype.constructor = DecimalFormat;

    global.DecimalFormat = DecimalFormat;

    return DecimalFormat;

} ) );
