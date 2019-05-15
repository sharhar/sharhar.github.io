var gctx;
var WIDTH;
var HEIGHT;

function draw() {
  WIDTH = 640;//document.getElementById('webcam').width;
  HEIGHT = 480;//document.getElementById('webcam').height;

  console.log(document.getElementById('webcam'));

  var canvas = document.getElementById('tutorial');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  if (canvas.getContext) {
    gctx = canvas.getContext('2d');
  }
}

function offset(channel, x, y) {
    var slice = Math.floor(channel / 4);
    var indexInSlice = channel - slice*4;
    return slice*13*13*4 + y*13*4 + x*4 + indexInSlice;
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function softmax(arr) {
    return arr.map(function(value,index) { 
      return Math.exp(value) / arr.map( function(y /*value*/){ return Math.exp(y) } ).reduce( function(a,b){ return a+b })
    })
}

function getImageData() {
  var canvas = document.createElement('canvas');
  canvas.width = 416;
  canvas.height = 416;
  ctx = canvas.getContext('2d');
  ctx.drawImage(document.getElementById('webcam'), 0, 0, 416, 416);

  const imageData = ctx.getImageData(0, 0, 416, 416);

  //console.log(imageData.data);

  const dataTensor = ndarray(new Float32Array(imageData.data), [416, 416, 4]);
  const dataProcessedTensor = ndarray(new Float32Array(416 * 416 * 3), [1, 3, 416, 416]);
  ndarray.ops.assign(dataProcessedTensor.pick(0, 0, null, null), dataTensor.pick(null, null, 0));
  ndarray.ops.assign(dataProcessedTensor.pick(0, 1, null, null), dataTensor.pick(null, null, 1));
  ndarray.ops.assign(dataProcessedTensor.pick(0, 2, null, null), dataTensor.pick(null, null, 2));

  return dataProcessedTensor.data;
}

function transpose(x, perm) {
  const inputDims = x.dims ? x.dims : [x.data.length];
  const rank = inputDims.length;

  // determine permutation to use
  // if no permutation was specified in the attributes,
  // the default is [rank-1, ..., 0]
  let finalPerm = new Array(rank);
  if (perm && perm.length === rank) {
    finalPerm = perm;
  } else {
    for (let i = 0; i < rank; i++) {
      finalPerm[i] = rank - i - 1;
    }
  }

  const outputDims = new Array(rank);
  const stride = new Array(rank);

  // determine shape of output, as well as stride to be used
  // stride[i] indicates the stride for the input-tensor dimension
  // corresponding to the i-th dimension of the output
  for (let i = 0; i < rank; i++) {
    const inpDim = finalPerm[i];
    outputDims[i] = inputDims[inpDim];
    if (inpDim + 1 < rank) {
      stride[i] = getSizeFromDimensionRange(inputDims, inpDim + 1, inputDims.length);
    } else {
      stride[i] = 1;
    }
  }
}

function getSizeFromDimensionRange(dims, start, end) {
  let size = 1;
  for (let i = start; i < end; i++) {
    // safety check as this method is called by multiple other methods requiring size.
    // size cannot be 0 or negative.
    if (dims[i] <= 0) {
      throw new Error(
          // tslint:disable-next-line:max-line-length
          `cannot get valid size from specified dimension range. Most likely the range contains 0 or negative values in them.`);
    }
    size *= dims[i];
  }
  return size;
}

var run = false;

function start() {
  run = true;
}

function stop() {
  run = false;
}

async function runExample() {
  if(!run){
    return;
  }

  // Create an ONNX inference session with default backend.
  const session = new onnx.InferenceSession({ backendHint: 'webgl' });
  // Load an ONNX model. This model is Resnet50 that takes a 1*3*224*224 image and classifies it.
  await session.loadModel("./model.onnx");

  var data = getImageData();
  const tensor = new Tensor(data, 'float32', [1, 3, 416, 416]);

  const outputMap = await session.run([tensor]);
  const outputData = outputMap.values().next().value.data;

  const originalOutput = new Tensor(outputData, 'float32', [1, 125, 13, 13]);

  requirejs.config({
    basePath: "./libs/"
  });

  require(['./libs/transpose'], function(transposeModule){
    const outputTensor = transposeModule.transpose(originalOutput, [0, 2, 3, 1]);

    require(['./libs/yolo'], function(yoloModule){
      //console.log(outputTensor);
      //console.log(yoloModule);
      const boxPromise = yoloModule.postprocess(outputTensor, 20);

      //console.log(boxPromise);

      boxPromise.then(function(boxes) {
        gctx.clearRect(0, 0, 640, 480);

        for(var i = 0; i < boxes.length; i++) {
          console.log(boxes[i]);
          var xscale = WIDTH/416.0;
          var yscale = HEIGHT/416.0;

          var x = boxes[i].left;
          var y = boxes[i].top;
          var w = boxes[i].right-x;
          var h = boxes[i].bottom-y;

          gctx.beginPath();
          //gctx.fillStyle = 'rgba(0, 255, 0, 1)';
          gctx.lineWidth = "4";
          gctx.strokeStyle = "rgba(0, 255, 0, 1)";
          gctx.rect(x*xscale, y*yscale, w*xscale, h*yscale);
          gctx.stroke();

          gctx.fillStyle = 'rgba(0, 255, 0, 1)';
          gctx.fillRect(x*xscale-2, y*yscale-36, w*xscale+4, 36);

          gctx.fillStyle = 'rgba(0, 0, 0, 1)';
          gctx.font = "16px Arial";
          gctx.fillText("Class: " + boxes[i].className, x*xscale, y*yscale-20);
          gctx.fillText("Confidence: " + (Math.round(boxes[i].classProb*1000)/10) + "%", x*xscale, y*yscale);
        }
      });
    });
  });
}