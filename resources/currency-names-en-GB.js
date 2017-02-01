( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        global.CurrencyNames = module.require( "./currency-names" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

} )( this, function( global ) {

    global.CurrencyNames[ "en-GB" ] = {
        "EUR": "\u20AC",
        "GBP": "\u00A3"
    };

    return global.CurrencyNames;

} );
