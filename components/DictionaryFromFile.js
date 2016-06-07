/**
 * Created by danrumney on 6/7/16.
 */
var Dictionary = require('../Dictionary');

module.exports = function dictFromFile() {
  var fileInPort = this.openInputPort('IN');
  var fileOutPort = this.openOutputPort('OUT');
  var dictPort = this.openOutputPort('DICT');

  var inIP;

  var symbols = {};
  var fileStack = [];
  while((inIP = fileInPort.receive()) !== null) {
    fileStack.push(inIP);
    if(inIP.type === this.IPTypes.NORMAL) {
      var inByte = inIP.contents;
      symbols[inByte] = true;
    }
  }

  var dictionary =  Dictionary.fromSymbolList([0].concat(Object.keys(symbols)));
  dictPort.send(this.createIP(dictionary.entries));

  var sendFileByte = function(byteIP) {
    fileOutPort.send(byteIP);
  }.bind(this);
  fileStack.forEach(sendFileByte);
};
