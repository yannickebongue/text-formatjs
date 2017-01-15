QUnit.module( "text-format: currency" );

QUnit.test( "Euro", function( assert ) {
    var currency = Currency.getInstance( "EUR" );
    assert.equal( currency.getDefaultFractionDigits(), 2 );
} );

QUnit.test( "Japanese Yen", function( assert ) {
    var currency = Currency.getInstance( "JPY" );
    assert.equal( currency.getDefaultFractionDigits(), 0 );
} );

QUnit.test( "Country currency", function( assert ) {
    var rootLocale = new Locale( "" );
    var locales = [
        { tag: "en-GB", currencyCode: "GBP", symbol: "£" },
        { tag: "en-US", currencyCode: "USD", symbol: "$" },
        { tag: "it-IT", currencyCode: "EUR", symbol: "€" }
    ];
    locales.forEach( function( item ) {
        var locale = Locale.forLanguageTag( item.tag );
        var currency = Currency.getInstance( locale );
        var countryName = locale.getDisplayCountry( rootLocale );
        assert.equal( currency.getCurrencyCode(), item.currencyCode, "The currency code of " + countryName + " is " + item.currencyCode );
        assert.equal( currency.getSymbol( locale ), item.symbol, "The currency symbol of " + countryName + " is " + item.symbol );
    } );
} );
