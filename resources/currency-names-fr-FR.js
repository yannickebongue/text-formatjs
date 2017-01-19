( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.require( "./currency-names" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    global.CurrencyNames[ "fr-FR" ] = {
        "EUR": "€",
        "FRF": "F"
    };

    return global.CurrencyNames[ "fr-FR" ];

} ) );
