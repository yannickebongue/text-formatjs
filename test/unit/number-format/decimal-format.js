QUnit.module( "text-format: decimal-format" );

QUnit.test( "Format number ", function( assert ) {
    var df = new DecimalFormat( "#,##0.###", new DecimalFormatSymbols( new Locale( "it", "IT" ) ) );
    var numbers = [ 0, 1, 10, 20, 1500.0, 25000.0, -0.75, 12.50 ];
    var results = [ "0", "1", "10", "20", "1.500", "25.000", "-0,75", "12,5" ];
    numbers.forEach( function( number, i ) {
        assert.equal( df.format( number ), results[ i ] );
    } );
} );

QUnit.test( "Format amount ", function( assert ) {
    var df = new DecimalFormat( "\u00A4#,##0.00;(\u00A4#,##0.00)", new DecimalFormatSymbols( new Locale( "en", "US" ) ) );
    var numbers = [ 0, 1, 10, 20, 1500.0, 2500000.0, -0.75, 0.5 ];
    var results = [ "$0.00", "$1.00", "$10.00", "$20.00", "$1,500.00", "$2,500,000.00", "($0.75)", "$0.50" ];
    numbers.forEach( function( number, i ) {
        assert.equal( df.format( number ), results[ i ] );
    } );
} );

QUnit.test( "Format percentage ", function( assert ) {
    var df = new DecimalFormat( "#,##0%", new DecimalFormatSymbols( new Locale( "en", "US" ) ) );
    var numbers = [ 1, 0.75, 1/2, 1/3, 0.60 ];
    var results = [ "100%", "75%", "50%", "33%", "60%" ];
    numbers.forEach( function( number, i ) {
        assert.equal( df.format( number ), results[ i ] );
    } );
} );

QUnit.test( "Parse number ", function( assert ) {
    var df = new DecimalFormat( "#,##0.00", new DecimalFormatSymbols( new Locale( "en", "US" ) ) );
    var sources = [ "0.00", "5.00", "10.00", "20.00", "1,500.00", "25,000.00", "-0.75", "0.50", "9.90" ];
    var results = [ 0, 5, 10, 20, 1500.0, 25000.0, -0.75, 0.5, 9.9 ];
    sources.forEach( function( text, i ) {
        assert.equal( df.parse( text ), results[ i ] );
    } );
} );

QUnit.test( "Parse amount ", function( assert ) {
    var df = new DecimalFormat( "\u00A4 #,##0.00;-\u00A4 #,##0.00", new DecimalFormatSymbols( new Locale( "en", "GB" ) ) );
    var sources = [ "£ 0.00", "£ 1.00", "£ 10.00", "£ 20.00", "£ 1,500.00", "£ 2,500,000.00", "-£ 0.75", "£ 0.50" ];
    var results = [ 0, 1, 10, 20, 1500, 2500000, -0.75, 0.5 ];
    sources.forEach( function( text, i ) {
        assert.equal( df.parse( text ), results[ i ] );
    } );
} );

QUnit.test( "Parse percentage ", function( assert ) {
    var df = new DecimalFormat( "#,##0%", new DecimalFormatSymbols( new Locale( "en", "US" ) ) );
    var sources = [ "100%", "75%", "50%", "33%", "60%" ];
    var results = [ 1, 0.75, 0.5, 0.33, 0.6 ];
    sources.forEach( function( text, i ) {
        assert.equal( df.parse( text ), results[ i ] );
    } );
} );
