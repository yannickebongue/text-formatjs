( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.require( "locale" );
        module.require( "format" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    function DateFormat( pattern, locale ) {
        global.Format.call( this );
        this.date = new Date();
    }

    return DateFormat;

} ) );