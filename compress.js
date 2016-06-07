/**
 * Created by danrumney on 5/30/16.
 */
var fbp = require('jsfbp');
var fs = require('fs');

global.trace = false;

fs.readFile('./lzw-compress.fbp', 'utf-8', function(err, graph) {
  if(err) {
    console.error(err);
    return;
  }
  var network = new fbp.Network.createFromGraph(graph, __dirname+'/components');
  var fiberRuntime = new fbp.FiberRuntime();
  network.run(fiberRuntime, {trace: global.trace}, function success() {
    console.log("Finished!");
  });
});

