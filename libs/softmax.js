define(["require", "exports", "./onnxjs", "./yoloPostprocessUtils"], function (require, exports, onnxjs_1, yoloPostprocessUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function softmax(x, axis) {
        var inputDimensions = x.dims ? x.dims : [x.data.length];
        var inputRank = inputDimensions.length;
        var axisCorrected = yoloPostprocessUtils_1.ShapeUtil.getActualAxisFromNegativeValue(axis, inputRank);
        var N = yoloPostprocessUtils_1.ShapeUtil.sizeToDimension(inputDimensions, axisCorrected);
        var D = yoloPostprocessUtils_1.ShapeUtil.sizeFromDimension(inputDimensions, axisCorrected);
        var X = x.data;
        var Y = yoloPostprocessUtils_1.TypedArrayUtil.createTypedArray(x.type, x.data.length);
        for (var i = 0; i < N; i++) {
            // find row offset
            var offset = i * D;
            // find max of each logical row
            var max = Number.MIN_VALUE;
            for (var j = 0; j < D; j++) {
                if (X[offset + j] > max) {
                    max = X[offset + j];
                }
            }
            // find normalization scale per row
            var scale = 0;
            for (var j = 0; j < D; j++) {
                var value = X[offset + j] - max;
                Y[offset + j] = Math.exp(value);
                scale += Math.exp(value);
            }
            // perform the softmax normalization
            for (var j = 0; j < D; j++) {
                if (scale === 0) {
                    Y[offset + j] = 0;
                }
                else {
                    Y[offset + j] /= scale;
                }
            }
        }
        return new onnxjs_1.Tensor(Y, x.type, inputDimensions);
    }
    exports.softmax = softmax;
});
