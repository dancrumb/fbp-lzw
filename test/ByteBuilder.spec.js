var fbp = require('jsfbp');
var MockSender = require('./mocks/MockSender');
var MockReceiver = require('./mocks/MockReceiver');
var ByteBuilder = require('../components/ByteBuilder');

function getTestNetwork(source, result) {
  var network = new fbp.Network();

  var sender = network.defProc(MockSender.generator(source), "sender");
  var bbuilder = network.defProc(ByteBuilder, "bbuilder");
  var receiver = network.defProc(MockReceiver.generator(result), "receiver");

  network.connect(sender, 'OUT', bbuilder, 'SYM');
  network.connect(bbuilder, 'BYTE', receiver, 'IN');
  return network;
}

describe('ByteBuilder', function () {
  it('handles 8 bit symbols', function (done) {

    var result = [];
    var network = getTestNetwork([{cSym: 0xFF, size: 8}], result);

    network.run(new fbp.FiberRuntime(), {trace: false}, function () {
      expect(result).to.deep.equal([0xFF]);
      done();
    });
  });
  it('handles 7 bit symbols', function (done) {

    var result = [];
    var network = getTestNetwork([{cSym: 0x7F, size: 7}], result);

    network.run(new fbp.FiberRuntime(), {trace: false}, function () {
      expect(result).to.deep.equal([0x7F]);
      done();
    });
  });
  it('handles 9 bit symbols', function (done) {

    var result = [];
    var network = getTestNetwork([{cSym: 0x1FF, size: 9}], result);

    network.run(new fbp.FiberRuntime(), {trace: false}, function () {
      expect(result).to.deep.equal([0xFF, 0x01]);
      done();
    });
  });
  it('handles multi symbol bytes', function (done) {

    var result = [];
    var network = getTestNetwork([{cSym: 0x3F, size: 6}, {cSym: 0x0a, size: 7}], result);

    network.run(new fbp.FiberRuntime(), {trace: false}, function () {
      expect(result).to.deep.equal([0xbf, 0x02]);
      done();
    });
  });
  it('handles multi symbol bytes - prime size', function (done) {

    var result = [];
    var network = getTestNetwork([{cSym: 0x1F, size: 5}, {cSym: 0x0a, size: 5}, {cSym: 0x05, size: 5}], result);

    network.run(new fbp.FiberRuntime(), {trace: false}, function () {
      expect(result).to.deep.equal([0x5f, 0x15]);
      done();
    });
  });
});
