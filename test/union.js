
var assert = require('assert')
  , ref = require('ref')
  , Struct = require('ref-struct')
  , Union = require('../')
  , bindings = require('./build/Release/native_tests')

describe('Union', function () {

  afterEach(gc)

  it('should be a function', function () {
    assert.equal('function', typeof Union)
  })

  it('should return a struct constuctor function', function () {
    var U = Union()
    assert.equal('function', typeof U)
  })

  it('should throw when the same field name is speicified more than once', function () {
    var U = Union({ a: ref.types.int })
    assert.throws(function () {
      U.defineProperty('a', ref.types.int)
    })
  })

  it('should work in a simple case', function () {
    var SimpleUnion = Union({
        'ival': ref.types.int
      , 'fval': ref.types.float
    })
    assert.equal(4, SimpleUnion.size)
    assert.equal(4, SimpleUnion.alignment)

    var su1 = new SimpleUnion({ ival: 10, fval: 1.5 })
    assert.equal(1.5, su1.fval)

    var su2 = new SimpleUnion({ fval: 1.5, ival: 10 })
    assert.equal(10, su2.ival)
  })

  // TODO: Complex example and Struct within Union / Union within Struct

  describe('string type identifiers', function () {

    it('should work with string type identifiers', function () {
      var U = Union({
          'ival': 'int'
        , 'lval': 'long'
        , 'sval': 'string'
      })

      assert.strictEqual(ref.types.int, U.fields.ival.type)
      assert.strictEqual(ref.types.long, U.fields.lval.type)
      assert.strictEqual(ref.types.Utf8String, U.fields.sval.type)
    })

  })

  describe('ref(), deref()', function () {

    it('should work to ref() and then deref() 1 level deep', function () {
      var U = Union({ d: 'double' })
      var u = new U({ d: Math.PI })
      var uref = u.ref()
      assert(Buffer.isBuffer(uref))
      var _u = uref.deref()
      assert(_u instanceof U)
      assert.equal(Math.PI, _u.d)
    })

  })

  describe('offsets and sizeofs', function () {

    function test (unionType, testNumber) {
      describe('Union test' + testNumber, function () {
        it('should have its `size` matching sizeof()', function () {
          var expectedSize = bindings['test' + testNumber + ' sizeof']
          assert.equal(expectedSize, unionType.size, 'test' + testNumber +
            ': sizeof(): expected ' + unionType.size + ' to equal ' + expectedSize)
        })
        it('should have its `alignment` matching __alignof__()', function () {
          var expectedAlignment = bindings['test' + testNumber + ' alignof']
          assert.equal(expectedAlignment, unionType.alignment, 'test' + testNumber +
            ': __alignof__(): expected ' + unionType.alignment + ' to equal ' + expectedAlignment)
        })
      })
    }

    var test1 = Union({
        'a': ref.types.char
      , 'b': ref.types.short
    })
    test(test1, 1)

    var test2 = Union({
        'a': ref.types.char
      , 'b': ref.types.int
    })
    test(test2, 2)

    var test3 = Union({
        'a': ref.types.char
      , 'b': ref.types.short
      , 'c': ref.types.int
    })
    test(test3, 3)

    var test4 = Union({
        'a': Struct({
            'a': ref.types.char
          , 'b': ref.types.short
          , 'c': ref.types.int
          })
      , 'b': ref.types.int
    })
    test(test4, 4)

 })

})
