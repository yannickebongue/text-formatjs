( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.require( "./format-data" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

}( this, function( global ) {

    global.FormatData[ "en-US" ] = {
        "NumberPatterns": [ "#,##0.###;-#,##0.###", "¤#,##0.00;(¤#,##0.00)", "#,##0%" ]
    };

    return global.FormatData[ "en-US" ];

} ) );
