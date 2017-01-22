QUnit.module( "text-format: message-format" );

QUnit.test( "Message format 1", function( assert ) {
    var form = new MessageFormat( "The disk \"{1}\" contains {0}.", new Locale( "en", "US" ) );
    var fileLimits = [ 0, 1, 2 ];
    var fileParts = [ "no files", "one file", "{0,number} files" ];
    var fileForm = new ChoiceFormat( fileLimits, fileParts );
    var fileCounts = [ 0, 1, 2, 3, 1273 ];
    var results = [
        "The disk \"MyDisk\" contains no files.",
        "The disk \"MyDisk\" contains one file.",
        "The disk \"MyDisk\" contains 2 files.",
        "The disk \"MyDisk\" contains 3 files.",
        "The disk \"MyDisk\" contains 1,273 files."
    ];
    form.setFormatByArgumentIndex( 0, fileForm );
    fileCounts.forEach( function( fileCount, i ) {
        assert.equal( form.format( [ fileCount, "MyDisk" ] ), results[ i ] );
    } );
} );

QUnit.test( "Message format 2", function( assert ) {
    var form = new MessageFormat( "The disk \"{1}\" contains {0,choice,0#no files|1#one file|1<{0,number,integer} files}.", new Locale( "en", "US" ) );
    var fileCounts = [ 0, 1, 2, 3, 1273 ];
    var results = [
        "The disk \"MyDisk\" contains no files.",
        "The disk \"MyDisk\" contains one file.",
        "The disk \"MyDisk\" contains 2 files.",
        "The disk \"MyDisk\" contains 3 files.",
        "The disk \"MyDisk\" contains 1,273 files."
    ];
    fileCounts.forEach( function( fileCount, i ) {
        assert.equal( form.format( [ fileCount, "MyDisk" ] ), results[ i ] );
    } );
} );

QUnit.test( "Format date time pattern", function( assert ) {
    var locales = [ "en-GB", "en-US", "es-ES", "fr-FR", "it-IT" ];
    var results = [ "dd/MM/yy HH:mm", "M/d/yy h:mm a", "d/MM/yy H:mm", "dd/MM/yy HH:mm", "dd/MM/yy H.mm" ];
    locales.forEach( function( tag, i ) {
        var locale = Locale.forLanguageTag( tag );
        var df = DateFormat.getDateTimeInstance( DateFormat.SHORT, DateFormat.SHORT, locale );
        assert.equal( df.toPattern(), results[ i ] );
    } );
} );
