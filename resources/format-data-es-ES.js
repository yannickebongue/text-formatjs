( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.require( "./format-data" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    global.FormatData[ "es-ES" ] = {
        "NumberPatterns": [ "#,##0.###;-#,##0.###", "#,##0 \u00A4;-#,##0 \u00A4", "#,##0%" ]
    };

    return global.FormatData[ "es-ES" ];

} ) );
