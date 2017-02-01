( function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        global.FormatData = module.require( "./format-data" );
        module.exports = factory( global );
    } else {
        factory( global );
    }

} )( this, function( global ) {

    global.FormatData[ "it-IT" ] = {
        "NumberPatterns": [ "#,##0.###;-#,##0.###", "\u00a4 #,##0.00;-\u00a4 #,##0.00", "#,##0%" ]
    };

    return global.FormatData;

} );
