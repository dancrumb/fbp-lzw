
module.exports = function bbuilder() {
  var symPort = this.openInputPort('SYM');
  var bytePort = this.openOutputPort('BYTE');
  var acc = 0;
  var accSize = 0;
  var symIP;

  while ((symIP = symPort.receive()) !== null) {
    var sym = symIP.contents;
    acc = acc | sym.cSym << accSize;
    accSize += sym.size;
    this.dropIP(symIP);

    while (accSize >= 8) {
      bytePort.send(this.createIP(acc & 0xFF));
      acc >>= 8;
      accSize -= 8;
    }
  }

  if(acc > 0) {
    bytePort.send(this.createIP(acc & 0xFF));
  }
};
