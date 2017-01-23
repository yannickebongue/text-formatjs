QUnit.module( "text-format: locale" );

QUnit.test( "Locale display name", function( assert ) {
    var locales = [
        { tag: "en", displayName: "English" },
        { tag: "en-GB", displayName: "English (United Kingdom)" },
        { tag: "en-US", displayName: "English (United States)" },
        { tag: "es", displayName: "español" },
        { tag: "es-ES", displayName: "español (España)" },
        { tag: "fr", displayName: "français" },
        { tag: "fr-FR", displayName: "français (France)" },
        { tag: "it", displayName: "italiano" },
        { tag: "it-IT", displayName: "italiano (Italia)" }
    ];
    locales.forEach( function( item ) {
        var locale = Locale.forLanguageTag( item.tag );
        assert.equal( locale.getDisplayName( locale ), item.displayName );
    } );
} );
