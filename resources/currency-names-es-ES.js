( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        global.CurrencyNames = module.require( "./currency-names" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

} )( this, function( global ) {

    global.CurrencyNames[ "es-ES" ] = {
        "ESP": "Pts",
        "EUR": "\u20AC"
    };

    return global.CurrencyNames;

} );
