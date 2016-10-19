module.exports = function () {
  var sizePort = this.openInputPort('SIZE');
  var sizeIP = sizePort.receive();
  var size = parseInt(sizeIP.contents, 10);
  this.dropIP(sizeIP);

  var outPort = this.openOutputPort('OUT');

  outPort.send(this.createIPBracket(this.IPTypes.OPEN));

  for(var i = 0; i < size; i++) {
    outPort.send(this.createIP(i));
  }
  outPort.send(this.createIPBracket(this.IPTypes.CLOSE));
};
