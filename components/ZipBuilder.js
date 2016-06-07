var Dictionary = require('../Dictionary');

module.exports = function zipBuilder() {
  var dictPort = this.openInputPort('DICT');
  var bytePort = this.openInputPort('BYTE');

  var outPort = this.openOutputPort('OUT');

  outPort.send(this.createIPBracket(this.IPTypes.OPEN));

  var ip = dictPort.receive();
  if(ip === null) {
    throw "Unexpected response from DICT";
  }

  var dictionary = Dictionary.fromEntries(ip.contents);
  this.dropIP(ip);
  
  var symbols = dictionary.getInitialSymbols();
  var symSize = dictionary.initialSymSize;
  var symLength = symbols.length;

  var symbolSender = function(byte) {
    outPort.send(this.createIP(byte));
  }.bind(this);

  outPort.send(this.createIP(symLength));
  outPort.send(this.createIP(symSize));
  symbols.forEach(symbolSender);

  while((ip = bytePort.receive()) !== null) {
    outPort.send(ip);
  }

  outPort.send(this.createIPBracket(this.IPTypes.CLOSE));

};
