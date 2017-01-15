QUnit.module( "text-format: decimal-format-symbols" );

QUnit.test( "Default decimal format symbols", function( assert ) {
    var dfs = new DecimalFormatSymbols( new Locale( "" ) );
    assert.equal( dfs.getDecimalSeparator(), "." );
    assert.equal( dfs.getGroupingSeparator(), "," );
    assert.equal( dfs.getPatternSeparator(), ";" );
    assert.equal( dfs.getPercent(), "%" );
    assert.equal( dfs.getZeroDigit(), "0" );
    assert.equal( dfs.getDigit(), "#" );
    assert.equal( dfs.getMinusSign(), "-" );
    assert.equal( dfs.getExponentialSymbol(), "E" );
    assert.equal( dfs.getPerMill(), "‰" );
    assert.equal( dfs.getInfinity(), "∞" );
    assert.equal( dfs.getNaN(), "�" );
} );

QUnit.test( "Country decimal format symbols", function( assert ) {
    var locales = [ "en-US", "en-GB", "it-IT" ];
    var symbols = [ "$", "£", "€" ];
    locales.forEach( function( tag, index ) {
        var symbol = symbols[ index ];
        var dfs = new DecimalFormatSymbols( Locale.forLanguageTag( tag ) );
        assert.equal( dfs.getCurrencySymbol(), symbol );
    } );
} );
