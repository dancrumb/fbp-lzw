var Dictionary = require('../Dictionary');

function getInitialSequence() {
  var sequence = [];
  var port = this.openInputPort('SEQ_IN');
  if(!port) {
    return sequence;
  }

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
  port.close();

  return sequence;
}

function getNextChar(port) {
  var nextCharIP = port.receive();
  if (nextCharIP !== null) {
    if (nextCharIP.type === this.IPTypes.OPEN) {
      this.dropIP(nextCharIP);
      nextCharIP = port.receive();
    }
    if (nextCharIP !== null && nextCharIP.type === this.IPTypes.CLOSE) {
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
  dictInPort.close();

  var nextCharPort = this.openInputPort('IN');

  var symOutPort = this.openOutputPort('OUT');

  var currentSequence = getInitialSequence.call(this);
  var nextChar;

  while ((nextChar = getNextChar.call(this, nextCharPort)) !== null) {
    if (currentSequence.length === 0) {
      currentSequence =[nextChar];

      nextChar = getNextChar.call(this, nextCharPort);
    }

    var cSym = null;
    var newSequence = currentSequence.slice(0);
    newSequence.push(nextChar);
    
    if (nextChar !== null) {
      cSym = dictionary.findSequence(newSequence);
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
        dictionary.insertSequence(newSequence);
        currentSequence = [nextChar];
      } else {
        nextCharPort.close();
      }

    } else {
      currentSequence = newSequence;
    }

  }
};
