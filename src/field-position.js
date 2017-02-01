( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        exports[ "FieldPosition" ] = module.exports = factory( global );
    } else {
        factory( global );
    }

} )( this, function( global ) {

    function FieldPosition( arg ) {
        var _this = this;

        this.field = 0;
        this.beginIndex = 0;
        this.endIndex = 0;
        this.attribute = null;
        if ( arg instanceof Format.Field ) {
            this.attribute = arg;
            if ( arguments.length > 1 ) {
                if ( typeof arguments[ 1 ] == "number" ) {
                    this.field = arguments[ 1 ];
                }
            }
        } else if ( typeof arg == "number" ) {
            this.field = arg;
        }

        this.__matchesField = function( attribute, field ) {
            if ( this.attribute ) {
                return this.attribute == attribute;
            }
            return field ? this.field == field : false;
        };

        this.getFieldDelegate = function() {
            return new Delegate();
        };

        var Delegate = function Delegate() {
            this.encounteredField = false;
        };

        Delegate.prototype.formatted = function( fieldID, attr, value, start, end, buffer ) {
            if ( !this.encounteredField && _this.__matchesField( attr, fieldID ) ) {
                _this.beginIndex = start;
                _this.endIndex = end;
                this.encounteredField = ( start != end );
            }
        };
    }

    FieldPosition.prototype.equals = function( other ) {
        if ( !other ) return false;
        if ( !( other instanceof FieldPosition ) ) return false;
        if ( !this.attribute ) {
            if ( other.attribute ) {
                return false;
            }
        } else if ( this.attribute != other.attribute ) {
            return false;
        }
        return this.beginIndex == other.beginIndex &&
                this.endIndex == other.endIndex &&
                this.field == other.field;
    };

    FieldPosition.prototype.toString = function() {
        return this.constructor.name +
            "[field = " + this.field + ", attribute = " + this.attribute +
            ", beginIndex = " + this.beginIndex +
            ", endIndex = " + this.endIndex + "]";
    };

    global.FieldPosition = FieldPosition;

    return FieldPosition;

} );
