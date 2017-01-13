( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    function DigitList() {
        var _this = this;
        // var _data = [];
        var _isNegative = false;

        var _round = function( maximumDigits ) {
            // Eliminate digits beyond maximum digits to be displayed.
            // Round up if appropriate.
            if (maximumDigits >= 0 && maximumDigits < _this.count) {
                if (_shouldRoundUp(maximumDigits)) {
                    // Rounding up involved incrementing digits from LSD to MSD.
                    // In most cases this is simple, but in a worst case situation
                    // (9999..99) we have to adjust the decimalAt value.
                    for (;;) {
                        --maximumDigits;
                        if (maximumDigits < 0) {
                            // We have all 9's, so we increment to a single digit
                            // of one and adjust the exponent.
                            _this.digits[0] = '1';
                            ++_this.decimalAt;
                            maximumDigits = 0; // Adjust the count
                            break;
                        }

                        ++_this.digits[maximumDigits];
                        if (_this.digits[maximumDigits] <= '9') break;
                        // this.digits[maximumDigits] = '0'; // Unnecessary since we'll truncate this
                    }
                    ++maximumDigits; // Increment for use as count
                }
                _this.count = maximumDigits;

                // Eliminate trailing zeros.
                while (_this.count > 1 && _this.digits[_this.count-1] == '0') {
                    --_this.count;
                }
            }
        };

        var _shouldRoundUp = function( maximumDigits ) {
            if ( maximumDigits < _this.count ) {
                if (_this.digits[maximumDigits] > '5') {
                    return true;
                } else if (_this.digits[maximumDigits] == '5' ) {
                    for (var i=maximumDigits+1; i<_this.count; ++i) {
                        if (_this.digits[i] != '0') {
                            return true;
                        }
                    }
                    return maximumDigits > 0 && (_this.digits[maximumDigits-1] % 2 != 0);
                }
            }
            return false;
        };

        var _isLongMIN_VALUE = function() {
            if (_this.decimalAt != _this.count || _this.count != DigitList.MAX_COUNT) {
                return false;
            }

            for (var i = 0; i < _this.count; ++i) {
                if (_this.digits[i] != LONG_MIN_REP[i]) return false;
            }

            return true;
        };

        this.decimalAt = 0;
        this.count = 0;
        this.digits = [];

        this.getDouble = function() {
            if ( this.count == 0 ) {
                return 0.0;
            }

            var temp = "";
            temp += ".";
            temp += this.digits.slice(0, this.count).join("");
            temp += "E";
            temp += this.decimalAt;
            return parseFloat( temp );
        };

        this.getLong = function() {
            // for now, simple implementation; later, do proper IEEE native stuff

            if ( this.count == 0 ) {
                return 0;
            }

            // We have to check for this, because this is the one NEGATIVE value
            // we represent.  If we tried to just pass the digits off to parseLong,
            // we'd get a parse failure.
            if ( _isLongMIN_VALUE() ) {
                return 0x8000000000000000;
             }

            var temp = "";
            temp += this.digits.slice(0, this.count).join("");
            for ( var i = this.count; i < this.decimalAt; ++i ) {
                temp += "0";
            }
            return parseInt( temp, 10 );
        };

        this.fitsIntoLong = function( isPositive, ignoreNegativeZero ) {
            // Figure out if the result will fit in a long.  We have to
            // first look for nonzero digits after the decimal point;
            // then check the size.  If the digit count is 18 or less, then
            // the value can definitely be represented as a long.  If it is 19
            // then it may be too large.

            // Trim trailing zeros.  This does not change the represented value.
            while (this.count > 0 && this.digits[this.count - 1] == '0') {
                --this.count;
            }

            if (this.count == 0) {
                // Positive zero fits into a long, but negative zero can only
                // be represented as a double. - bug 4162852
                return isPositive || ignoreNegativeZero;
            }

            if (this.decimalAt < this.count || this.decimalAt > DigitList.MAX_COUNT) {
                return false;
            }

            if (this.decimalAt < DigitList.MAX_COUNT) return true;

            // At this point we have decimalAt == count, and count == MAX_COUNT.
            // The number will overflow if it is larger than 9223372036854775807
            // or smaller than -9223372036854775808.
            for (var i=0; i<this.count; ++i) {
                var dig = parseInt(this.digits[i], 10), max = parseInt(LONG_MIN_REP[i], 10);
                if (dig > max) return false;
                if (dig < max) return true;
            }

            // At this point the first count digits match.  If decimalAt is less
            // than count, then the remaining digits are zero, and we return true.
            if (this.count < this.decimalAt) return true;

            // Now we have a representation of Long.MIN_VALUE, without the leading
            // negative sign.  If this represents a positive value, then it does
            // not fit; otherwise it fits.
            return !isPositive;
        };

        this.set = function( isNegative, s, maximumDigits, fixedPoint ) {
            _isNegative = isNegative;
            var len = s.length;
            var source = s.split( "" );

            this.decimalAt = -1;
            this.count = 0;
            var exponent = 0;
            // Number of zeros between decimal point and first non-zero digit after
            // decimal point, for numbers < 1.
            var leadingZerosAfterDecimal = 0;
            var nonZeroDigitSeen = false;

            for (var i = 0; i < len; ) {
                var c = source[i++];
                if (c == ".") {
                    this.decimalAt = this.count;
                } else if (c == 'e' || c == 'E') {
                    exponent = parseInt(source.slice( i, len ).join(""), 10);
                    break;
                } else {
                    if (!nonZeroDigitSeen) {
                        nonZeroDigitSeen = (c != '0');
                        if (!nonZeroDigitSeen && this.decimalAt != -1)
                            ++leadingZerosAfterDecimal;
                    }
                    if (nonZeroDigitSeen) {
                        this.digits[this.count++] = c;
                    }
                }
            }
            if (this.decimalAt == -1) {
                this.decimalAt = this.count;
            }
            if (nonZeroDigitSeen) {
                this.decimalAt += exponent - leadingZerosAfterDecimal;
            }

            if (fixedPoint) {
                // The negative of the exponent represents the number of leading
                // zeros between the decimal and the first non-zero digit, for
                // a value < 0.1 (e.g., for 0.00123, -decimalAt == 2).  If this
                // is more than the maximum fraction digits, then we have an underflow
                // for the printed representation.
                if (-this.decimalAt > maximumDigits) {
                    // Handle an underflow to zero when we round something like
                    // 0.0009 to 2 fractional digits.
                    this.count = 0;
                    return;
                } else if (-this.decimalAt == maximumDigits) {
                    // If we round 0.0009 to 3 fractional digits, then we have to
                    // create a new one digit in the least significant location.
                    if (_shouldRoundUp(0)) {
                        this.count = 1;
                        ++this.decimalAt;
                        this.digits[0] = '1';
                    } else {
                        this.count = 0;
                    }
                    return;
                }
                // else fall through
            }

            // Eliminate trailing zeros.
            while (this.count > 1 && this.digits[this.count - 1] == '0') {
                --this.count;
            }

            // Eliminate digits beyond maximum digits to be displayed.
            // Round up if appropriate.
            _round((fixedPoint ? (maximumDigits + this.decimalAt) : maximumDigits));
        };
    }
    var LONG_MIN_REP = "9223372036854775808".split( "" );

    DigitList.MAX_COUNT = 19;

    DigitList.prototype.isZero = function() {
        for (var i = 0; i < this.count; ++i) {
            if (this.digits[ i ] != "0") {
                return false;
            }
        }
        return true;
    };

    DigitList.prototype.clear = function() {
        this.decimalAt = 0;
        this.count = 0;
    };

    DigitList.prototype.append = function( digit ) {
        this.digits.push( digit );
        this.count = this.digits.length;
    };

    DigitList.prototype.toString = function() {
        if ( this.isZero() ) {
            return "0";
        }
        var buf = "";
        buf += "0.";
        buf += this.digits.join("");
        buf += "x10^";
        buf += this.decimalAt;
        return buf;
    };

    global.DigitList = DigitList;

    return DigitList;

} ) );
