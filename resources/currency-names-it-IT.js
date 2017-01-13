( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.require( "./currency-names" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    global.CurrencyNames[ "it-IT" ] = {
        "EUR": "€",
        "ITL": "L."
    };

    return global.CurrencyNames[ "it-IT" ];

} ) );
