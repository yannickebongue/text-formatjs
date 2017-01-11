( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    function Format() {}

    Format.prototype.format = function( number ) {
        return undefined;
    };

    Format.prototype.parse = function( source ) {
        return undefined;
    };

    Format.Field = function Field( name ) {
        this.name = name;
    };

    Format.Field.prototype.toString = function() {
        return this.constructor.name + "(" + this.name + ")";
    };

    global.Format = Format;

    return Format;

} ) );