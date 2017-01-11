( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    function ParsePosition( index ) {
        this.index = 0;
        this.errorIndex = -1;
        this.index = index;
    }

    ParsePosition.prototype.toString = function() {
        return this.constructor.name +
            "[index = " + this.index +
            ", errorIndex = " + this.errorIndex + "]";
    };

    global.ParsePosition = ParsePosition;

    return ParsePosition;

} ) );
