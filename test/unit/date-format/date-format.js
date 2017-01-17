QUnit.module( "text-format: date-format" );

QUnit.test( "Format date", function( assert ) {
    var date = new Date( 2017, 0, 16 );
    var locale = new Locale( "it", "IT" );
    var sdf = new SimpleDateFormat( "EEEE d MMMM yyyy", locale );
    assert.equal( sdf.format( date ), "lunedì 16 gennaio 2017" );
    sdf.applyPattern( "d-MMM-yyyy" );
    assert.equal( sdf.format( date ), "16-gen-2017" );
    sdf.applyPattern( "dd/MM/yy" );
    assert.equal( sdf.format( date ), "16/01/17" );
} );

QUnit.test( "Format time", function( assert ) {
    var date = new Date( 2017, 0, 1, 12, 45, 33, 235 );
    var locale = new Locale( "en", "US" );
    var sdf = new SimpleDateFormat( "h:mm a", locale );
    assert.equal( sdf.format( date ), "12:45 PM" );
    date.setHours( date.getHours() + 1 );
    assert.equal( sdf.format( date ), "1:45 PM" );
    date.setHours( 15, 35, 1 );
    sdf.applyPattern( "h:mm:ss a" );
    assert.equal( sdf.format( date ), "3:35:01 PM" );
    sdf.applyPattern( "h:mm:ss a Z" );
    assert.equal( sdf.format( date ), "3:35:01 PM +0100" );
} );

QUnit.test( "Format date and time", function( assert ) {
    var date = new Date( 2017, 0, 1, 12, 45, 33, 235 );
    var locale = new Locale( "en", "US" );
    var sdf = new SimpleDateFormat( "yyyy-MM-dd'T'HH:mm:ss.SSS", locale );
    assert.equal( sdf.format( date ), "2017-01-01T12:45:33.235" );
} );

QUnit.test( "Parse date", function( assert ) {
    var locale = new Locale( "en", "US" );
    var df = DateFormat.getDateInstance( DateFormat.SHORT, locale );
    var sdf = new SimpleDateFormat( "dd/MM/yyyy", locale );
    var date = sdf.parse( "05/01/2017" );
    assert.equal( df.format( date ), "1/5/17" );
    sdf.applyPattern( "MMMM d, yyyy" );
    date = sdf.parse( "February 11, 2016" );
    assert.equal( df.format( date ), "2/11/16" );
    sdf.applyPattern( "EEEE, MMMM d, yyyy" );
    date = sdf.parse( "Tuesday, January 17, 2017" );
    assert.equal( df.format( date ), "1/17/17" );
} );

QUnit.test( "Parse time", function( assert ) {
    var locale = new Locale( "it", "IT" );
    var df = DateFormat.getTimeInstance( DateFormat.SHORT, locale );
    var dfs = new DateFormatSymbols( locale );
    var sdf = new SimpleDateFormat();
    sdf.setDateFormatSymbols( dfs );
    sdf.applyPattern( "H.mm" );
    var date = sdf.parse( "9.50" );
    assert.equal( df.format( date ), "9.50" );
    sdf.applyPattern( "H.mm.ss" );
    date = sdf.parse( "15.24.45" );
    assert.equal( df.format( date ), "15.24" );
} );
