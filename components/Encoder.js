var Dictionary = require('../Dictionary');
var _ = require('lodash');

function getCurrentSequence(port) {
  var sequence = [];
  var ip = port.receive();
  if (ip.type !== this.IPTypes.OPEN) {
    throw new Error("Unexpected IP received");
  }
  this.dropIP(ip);
  ip = port.receive();

  while (ip.type !== this.IPTypes.CLOSE) {
    sequence.push(ip.contents);
    this.dropIP(ip);
    ip = port.receive()
  }
  this.dropIP(ip);

  return sequence;
}

function sendCurrentSequence(port, sequence) {
  port.send(this.createIPBracket(this.IPTypes.OPEN));
  _.forEach(sequence, function (byte) {
    port.send(this.createIP(byte));
  }.bind(this));
  port.send(this.createIPBracket(this.IPTypes.CLOSE));
}

function getNextChar(port) {
  var nextCharIP = port.receive();
  if (nextCharIP !== null) {
    if(nextCharIP.type === this.IPTypes.OPEN) {
      this.dropIP(nextCharIP);
      nextCharIP = port.receive();
    }
    if(nextCharIP !== null && nextCharIP.type === this.IPTypes.CLOSE) {
      this.dropIP(nextCharIP);
      nextCharIP = null;
    }
  }
  if (nextCharIP === null) {
    return null;
  }
  var nextChar = nextCharIP.contents;
  this.dropIP(nextCharIP);
  return nextChar;
}


module.exports = function encoder() {
  "use strict";

  var dictInPort = this.openInputPort('DICT_IN');
  var dictIP = dictInPort.receive();
  var dictionary = Dictionary.fromEntries(dictIP.contents);
  this.dropIP(dictIP);


  var nextCharPort = this.openInputPort('NEXT');
  var currSeqInPort = this.openInputPort('SEQ_IN');

  var currSeqOutPort = this.openOutputPort('SEQ_OUT');
  var symOutPort = this.openOutputPort('SYM');

  //console.log("---");
  var nextChar = getNextChar.call(this, nextCharPort);

  var currentSequence = getCurrentSequence.call(this, currSeqInPort);

  if (currentSequence.length === 0) {
    sendCurrentSequence.call(this, currSeqOutPort, [nextChar]);
    nextChar = getNextChar.call(this, nextCharPort);
    currentSequence = getCurrentSequence.call(this, currSeqInPort);
  }

  var cSym = null;
  if (nextChar !== null) {
    cSym = dictionary.findSequence(currentSequence.concat(nextChar));
  }
  if (cSym === null) {
    cSym = dictionary.findSequence(currentSequence);
    if (cSym === null) {
      throw new Error("Missing sequence: " + currentSequence);
    }
    var symIP = this.createIP({
      cSym: cSym,
      size: dictionary.symSize
    });
    symOutPort.send(symIP);

    if (nextChar !== null) {
      dictionary.insertSequence(currentSequence.concat(nextChar));
      sendCurrentSequence.call(this, currSeqOutPort, [nextChar]);
    } else {
      dictInPort.close();
      currSeqInPort.close();
      nextCharPort.close();
    }

  } else {
    sendCurrentSequence.call(this, currSeqOutPort, currentSequence.concat(nextChar));
  }

  if (nextChar !== null) {
    var dictOutPort = this.openOutputPort('DICT_OUT');
    dictOutPort.send(this.createIP(dictionary.entries));
  }


};
