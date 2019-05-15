define(["require", "exports", "./onnxjs", "./yoloPostprocessUtils"], function (require, exports, onnxjs_1, yoloPostprocessUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function reshape(x, shape) {
        var reshapedDims = yoloPostprocessUtils_1.ShapeUtil.calculateReshapedDims(x.dims, shape);
        var output = new onnxjs_1.Tensor(yoloPostprocessUtils_1.TypedArrayUtil.createTypedArray(x.type, x.data.length), x.type, reshapedDims);
        var X = x.data;
        var Y = output.data;
        for (var i = 0; i < x.data.length; ++i) {
            Y[i] = X[i];
        }
        return output;
    }
    exports.reshape = reshape;
});
