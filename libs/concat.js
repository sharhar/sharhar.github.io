define(["require", "exports", "./onnxjs", "./yoloPostprocessUtils"], function (require, exports, onnxjs_1, yoloPostprocessUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function concat(x, axis) {
        var input0 = x[0];
        var inputShape = input0.dims ? input0.dims : [input0.data.length];
        if (axis >= inputShape.length || axis < (-1 * inputShape.length)) {
            throw new Error("axis specified for concat doesn't match input dimensionality");
        }
        if (axis < 0) {
            axis = inputShape.length + axis;
        }
        // ensure all of the non-concatenated axes match each other
        // along the way, calculate the shape of the output tensor
        var concatAxisSize = inputShape[axis];
        var outputShape = new Array(inputShape.length);
        for (var i = 1; i < x.length; i++) {
            var dataN = x[i];
            var dataNShape = dataN.dims ? dataN.dims : [dataN.data.length];
            for (var axisIndex = 0; axisIndex < inputShape.length; axisIndex++) {
                // add to the placeholder for computing output shape
                if (axisIndex === axis) {
                    concatAxisSize += dataNShape[axisIndex];
                }
                // ensure all non-cancatenated axes match each other
                if (inputShape[axisIndex] !== dataNShape[axisIndex]) {
                    throw new Error("non concat dimensions must match");
                }
                // fill the 'outputShape' array
                outputShape[axisIndex] = dataNShape[axisIndex];
            }
        }
        // complete the 'outputShape' array
        outputShape[axis] = concatAxisSize;
        // main logic
        // tslint:disable-next-line:max-line-length
        var output = new onnxjs_1.Tensor(yoloPostprocessUtils_1.TypedArrayUtil.createTypedArray(x[0].type, yoloPostprocessUtils_1.ShapeUtil.size(outputShape)), input0.type, outputShape);
        var Y = output.data;
        // the axisPitch is the number of elements to add to move
        // to the next split axis in the output
        var axisPitch = 1;
        for (var i = outputShape.length - 1; i >= axis; i--) {
            axisPitch *= outputShape[i];
        }
        var outputBase = 0;
        for (var inputIndex = 0; inputIndex < x.length; inputIndex++) {
            var dataN = x[inputIndex];
            var dataNDims = dataN.dims ? dataN.dims : [dataN.data.length];
            // the inputAxisPitch is the number of elements to add
            // to move to the next split axis in the input
            var inputAxisPitch = 1;
            for (var i = dataNDims.length - 1; i >= axis; i--) {
                inputAxisPitch *= dataNDims[i];
            }
            var inputData = dataN.data;
            var inputSize = yoloPostprocessUtils_1.ShapeUtil.size(dataNDims);
            // copy the data across.
            // for every 'inputAxisPitch' values copied, we move over by
            // the 'axisPitch'
            var outputOffset = outputBase;
            for (var i = 0, j = 0; i < inputSize; i++) {
                Y[outputOffset + i] = inputData[i];
                if (++j === inputAxisPitch) {
                    // subtract inputAxisPitch because output is being indexed by 'i'
                    outputOffset += (axisPitch - inputAxisPitch);
                    j = 0;
                }
            }
            outputBase += inputAxisPitch;
        }
        return output;
    }
    exports.concat = concat;
});
