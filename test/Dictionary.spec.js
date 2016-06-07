var Dictionary = require('../Dictionary');

describe("Dictionary", function () {
  it('can be built by setting the keySize', function () {
    var d = Dictionary.build(1);

    expect(d.entries).to.deep.equal({0: {cSym: 0}, 1: {cSym: 1}});
    expect(d.symSize).to.equal(1);

    d = Dictionary.build(2);

    expect(d.entries).to.deep.equal({0: {cSym: 0}, 1: {cSym: 1}, 2: {cSym: 2}, 3: {cSym: 3}});
    expect(d.symSize).to.equal(2);
  });

  it('can provide keys for single character sequences', function () {
    var dictionary = Dictionary.fromEntries({0: {cSym: 0}, 1: {cSym: 1}, 2: {cSym: 2}, 3: {cSym: 3}});

    expect(dictionary.findSequence([1])).to.equal(1);
    expect(dictionary.symSize).to.equal(2);
    expect(dictionary.lastKey).to.equal(3);

    expect(dictionary.findSequence([5])).to.be.null;

  });

  it('can provide keys for multi-character sequences', function () {
    var dictionary = Dictionary.fromEntries({0: {cSym: 0, 5: {cSym: 4}}, 1: {cSym: 1}, 2: {cSym: 2}, 3: {cSym: 3}});

    expect(dictionary.findSequence([0, 5])).to.equal(4);
    expect(dictionary.symSize).to.equal(2);
    expect(dictionary.lastKey).to.equal(4);

    expect(dictionary.findSequence([5, 7])).to.be.null;

  });

  it('allows the creation of new sequences by appending to old ones', function () {
    var dictionary = Dictionary.fromEntries({0: {cSym: 0, 5: {cSym: 4}}, 1: {cSym: 1}, 2: {cSym: 2}, 3: {cSym: 3}});
    dictionary.insertSequence([0, 5, 6]);
    expect(dictionary.findSequence([0, 5, 6])).to.equal(5);
    expect(dictionary.lastKey).to.equal(5);
    expect(dictionary.symSize).to.equal(3);

    dictionary = Dictionary.fromEntries({0: {cSym: 0}, 1: {cSym: 1}, 2: {cSym: 2}, 3: {cSym: 3}});
    dictionary.insertSequence([4]);
    expect(dictionary.findSequence([4])).to.equal(4);
    expect(dictionary.lastKey).to.equal(4);
    expect(dictionary.symSize).to.equal(3);
  });

  it('can be build from lists of characters', function () {
    var dictionary = Dictionary.fromSymbolList([0, 1, 2, 3]);

    expect(dictionary).to.eql({
      entries: {0: {cSym: 0}, 1: {cSym: 1}, 2: {cSym: 2}, 3: {cSym: 3}},
      "lastKey": 3,
      "symSize": 2,
      __proto__: Dictionary.prototype
    });


    expect(dictionary.findSequence([1])).to.equal(1);
    expect(dictionary.symSize).to.equal(2);
    expect(dictionary.lastKey).to.equal(3);

    expect(dictionary.findSequence([5])).to.be.null;

  });

  it('can deliver the initial characters from the dictionary.', function () {
    var dictionary = Dictionary.fromEntries({0: {cSym: 0, 5: {cSym: 4}}, 1: {cSym: 1}, 2: {cSym: 2}, 3: {cSym: 3}});
    dictionary.insertSequence([0, 5, 6]);

    expect(dictionary.getInitialSymbols()).to.deep.equal([0,1,2,3]);

    dictionary = Dictionary.fromEntries({10: {cSym: 0}, 23: {cSym: 1}, 5: {cSym: 2}, 3: {cSym: 3}});
    expect(dictionary.getInitialSymbols()).to.deep.equal([10, 23, 5, 3]);

  });

});
