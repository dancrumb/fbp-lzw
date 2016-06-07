var _ = require('lodash');

function findSeqEntry(sequence, dictionary) {
  return sequence.reduce(function (previousEntry, seqByte) {
    if (previousEntry) {
      return previousEntry[seqByte];
    } else {
      return null;
    }
  }, dictionary);
}

var Dictionary = function () {
};


Dictionary.prototype.findSequence = function (sequence) {
  if(!_.isArray(sequence)) {
    console.error("Received invalid sequence");
    console.error(sequence);
    throw new Error("Invalid sequence");
  }
  var seqEntry = findSeqEntry(sequence, this.entries);

  return seqEntry ? seqEntry.cSym : null;
};

Dictionary.prototype.insertSequence = function (sequence) {
  var lastChar = sequence.length - 1;
  var seqEntry = findSeqEntry(sequence.slice(0, lastChar), this.entries);
  if(!seqEntry) {
    console.log("Failed to find " + sequence.slice(0, lastChar) + " in ");
    console.log(this.entries);
    throw new Error("Missing sequence");
  }

  this.lastKey += 1;
  if(sequence[lastChar] === null) {
    console.log(this);
    console.log(sequence);
  }
  seqEntry[sequence[lastChar]] = {cSym: this.lastKey};

  if (1 << this.symSize <= this.lastKey) {
    this.symSize += 1;
  }
};

Dictionary.build = function (keySize) {
  var dictionary = new Dictionary();
  dictionary.symSize = keySize;
  dictionary.lastKey = (1 << keySize) - 1;
  dictionary.entries = {};

  for (var i = 0; i <= dictionary.lastKey; i++) {
    dictionary.entries[i] = {cSym: i};
  }


  return dictionary;
};

Object.__defineGetter__('entries', function () {
  return this.entries;
});

Object.__defineGetter__('symSize', function () {
  return this.symSize;
});

var reduce = function (entry) {
  var cSym = entry.cSym;
  return Object.keys(entry).reduce(function (maxSym, char) {
    if (char === "cSym") {
      return maxSym;
    } else {
      return reduce(entry[char]);
    }
  }, cSym);
};

function getSymSize(lastKey) {
  var size = 0;
  while ((1 << size) < lastKey) {
    size += 1;
  }
  return size;
}

Dictionary.fromEntries = function (entries) {
  var dictionary = new Dictionary();
  dictionary.entries = entries;
  var maxSym = Object.keys(dictionary.entries).reduce(function (maxSym, char) {
    var entry = entries[char];
    var entryMax = reduce(entry);
    if (entryMax > maxSym) {
      return entryMax
    } else {
      return maxSym;
    }
  }, 0);

  dictionary.lastKey = maxSym;
  dictionary.symSize = getSymSize(maxSym);
  dictionary.initialSymSize = dictionary.symSize;

  return dictionary;
};

Dictionary.fromSymbolList = function (symbols) {
  var entries = symbols.reduce(function(entries, symbol, index) {
    entries[symbol] = { cSym: index };
    return entries;

  },{});
  return Dictionary.fromEntries(entries);
};

Dictionary.prototype.getInitialSymbols = function () {
  var entries = this.entries;
  var symbols = Object.keys(entries);
  var symbolList = new Array(symbols.length);
  symbols.forEach(function(symbol) {
    symbolList[entries[symbol].cSym] = +symbol;
  });

  return symbolList;
};


module.exports = Dictionary;
