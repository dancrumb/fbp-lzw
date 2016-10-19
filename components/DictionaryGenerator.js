var Dictionary = require('../Dictionary');

/**
 * Created by danrumney on 5/31/16.
 */


module.exports = function dictgen() {
  "use strict";

  var inPort = this.openInputPort('IN');
  var syms = {};

  var symIP = inPort.receive();
  if(symIP.type !== this.IPTypes.OPEN) {
    console.log(symIP);
    throw "Unexpected IP";
  }
  this.dropIP(symIP);

  while((symIP =inPort.receive()) !== null) {
    if(symIP.type !== this.IPTypes.CLOSE) {
      syms[symIP.contents] = true;
    }
    this.dropIP(symIP);
  }

  var dictionary = Dictionary.fromSymbolList(Object.keys(syms));

  var dictOutPort = this.openOutputPort('OUT');
  dictOutPort.send(this.createIP(dictionary.entries));

  inPort.close();
};
