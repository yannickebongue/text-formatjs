( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.require( "./currency-names" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    global.CurrencyNames[ "es-ES" ] = {
        "ESP": "Pts",
        "EUR": "€"
    };

    return global.CurrencyNames[ "es-ES" ];

} ) );
