( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.require( "./currency-names" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    global.CurrencyNames[ "en-GB" ] = {
        "EUR": "€",
        "GBP": "£"
    };

    return global.CurrencyNames[ "en-GB" ];

} ) );
