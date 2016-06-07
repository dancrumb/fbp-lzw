var Dictionary = require('../Dictionary');

/**
 * Created by danrumney on 5/31/16.
 */


module.exports = function dictgen() {
  "use strict";

  var sizeInPort = this.openInputPort('SIZE');
  var sizeIP = sizeInPort.receive();
  var size = sizeIP.contents;
  this.dropIP(sizeIP);

  var dictionary = Dictionary.build(size);

  var dictOutPort = this.openOutputPort('DICT');
  dictOutPort.send(this.createIP(dictionary.entries));
};
