QUnit.module( "text-format: date-format" );

QUnit.test( "Format date IT locale", function( assert ) {
    var date = new Date( 2017, 0, 16 );
    var locale = new Locale( "it", "IT" );
    var sdf = new SimpleDateFormat( "EEEE d MMMM yyyy", locale );
    assert.equal( sdf.format( date ), "lunedì 16 gennaio 2017" );
    sdf.applyPattern( "d-MMM-yyyy" );
    assert.equal( sdf.format( date ), "16-gen-2017" );
    sdf.applyPattern( "dd/MM/yy" );
    assert.equal( sdf.format( date ), "16/01/17" );
} );

QUnit.test( "Format time US locale", function( assert ) {
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

QUnit.test( "Parse date IT locale", function( assert ) {
    var locale = new Locale( "it", "IT" );
    var df = DateFormat.getDateInstance( DateFormat.DEFAULT, locale );
    var sdf = new SimpleDateFormat( "dd/MM/yy", locale );
    var date = sdf.parse( "05/01/17" );
    assert.equal( df.format( date ), "5-gen-2017" );
    sdf.applyPattern( "d MMMM yyyy" );
    date = sdf.parse( "11 febbraio 2016" );
    assert.equal( df.format( date ), "11-feb-2016" );
    sdf.applyPattern( "EEEE d MMMM yyyy" );
    date = sdf.parse( "martedì 17 gennaio 2017" );
    assert.equal( df.format( date ), "17-gen-2017" );
} );

QUnit.test( "Parse time US locale", function( assert ) {
    var locale = new Locale( "en", "US" );
    var df = DateFormat.getTimeInstance( DateFormat.DEFAULT, locale );
    var dfs = new DateFormatSymbols( locale );
    var sdf = new SimpleDateFormat();
    var date;
    sdf.setDateFormatSymbols( dfs );
    sdf.applyPattern( "h:mm a" );
    date = sdf.parse( "9:50 AM" );
    assert.equal( df.format( date ), "9:50:00 AM" );
    date = sdf.parse( "1:15 PM" );
    assert.equal( df.format( date ), "1:15:00 PM" );
    sdf.applyPattern( "H:mm:ss" );
    date = sdf.parse( "18:24:45" );
    assert.equal( df.format( date ), "6:24:45 PM" );
} );

QUnit.test( "Parse time IT locale", function( assert ) {
    var locale = new Locale( "it", "IT" );
    var df = DateFormat.getTimeInstance( DateFormat.DEFAULT, locale );
    var dfs = new DateFormatSymbols( locale );
    var sdf = new SimpleDateFormat();
    var date;
    sdf.setDateFormatSymbols( dfs );
    sdf.applyPattern( "HH:mm" );
    date = sdf.parse( "09:50" );
    assert.equal( df.format( date ), "9.50.00" );
    date = sdf.parse( "13:15" );
    assert.equal( df.format( date ), "13.15.00" );
    sdf.applyPattern( "K:mm:ss" );
    date = sdf.parse( "24:13:45" );
    assert.equal( df.format( date ), "0.13.45" );
} );
