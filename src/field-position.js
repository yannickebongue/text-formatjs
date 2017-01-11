( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    function FieldPosition( arg ) {
        this.field = 0;
        this.beginIndex = 0;
        this.endIndex = 0;
        this.attribute = null;
        if ( arg instanceof global.Format.Field ) {
            this.attribute = arg;
            if ( arguments.length > 1 ) {
                if ( typeof arguments[ 1 ] == "number" ) {
                    this.field = arguments[ 1 ];
                }
            }
        } else if ( typeof arg == "number" ) {
            this.field = arg;
        }
    }

    FieldPosition.prototype.toString = function() {
        return this.constructor.name +
            "[field = " + this.field + ", attribute = " + this.attribute +
            ", beginIndex = " + this.beginIndex +
            ", endIndex = " + this.endIndex + "]";
    };

    global.FieldPosition = FieldPosition;

    return FieldPosition;

} ) );
