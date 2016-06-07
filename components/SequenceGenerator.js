
module.exports = function seqgen() {
  "use strict";

  var outPort = this.openOutputPort('OUT');
  outPort.send(this.createIPBracket(this.IPTypes.OPEN));
  outPort.send(this.createIPBracket(this.IPTypes.CLOSE));
};
