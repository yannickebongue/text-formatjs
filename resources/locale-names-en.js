( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        global.LocaleNames = module.require( "./locale-names" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

} )( this, function( global ) {

    global.LocaleNames[ "en" ] = {};

    return global.LocaleNames;

} );
