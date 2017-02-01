( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        global.FormatData = module.require( "./format-data" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

} )( this, function( global ) {

    global.FormatData[ "fr-FR" ] = {};

    return global.FormatData;

} );
