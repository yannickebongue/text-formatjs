QUnit.module( "text-format: core" );

QUnit.test( "Default locale", function( assert ) {
    var locale = Locale.getDefault();
    assert.equal( locale.toString(), navigator.language, "The default locale is '" + locale + "'" );
} );
