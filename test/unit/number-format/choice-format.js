QUnit.module( "text-format: choice-format" );

QUnit.test( "Choice format pattern", function( assert ) {
    var fmt = new ChoiceFormat(
        "-1#is negative| 0#is zero or fraction | 1#is one |1.0<is 1+ |2#is two |2<is more than 2.");
    assert.equal( fmt.format( Number.NEGATIVE_INFINITY ), "is negative" );
    assert.equal( fmt.format( -1.0 ), "is negative" );
    assert.equal( fmt.format( 0 ), "is zero or fraction " );
    assert.equal( fmt.format( 0.9 ), "is zero or fraction " );
    assert.equal( fmt.format( 1 ), "is one " );
    assert.equal( fmt.format( 1.5 ), "is 1+ " );
    assert.equal( fmt.format( 2 ), "is two " );
    assert.equal( fmt.format( 2.1 ), "is more than 2." );
    assert.equal( fmt.format( Number.NaN ), "is negative" );
    assert.equal( fmt.format( Number.POSITIVE_INFINITY ), "is more than 2." );
} );
