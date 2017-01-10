( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    function Format() {}

    Format.prototype.format = undefined;

    Format.prototype.parse = undefined;

    global.Format = Format;

    return Format;

} ) );