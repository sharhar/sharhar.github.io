define(["require", "exports", "./onnxjs", "./yoloPostprocessUtils"], function (require, exports, onnxjs_1, yoloPostprocessUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function sigmoid(input) {
        var X = input.data;
        var Y = yoloPostprocessUtils_1.TypedArrayUtil.createTypedArray(input.type, X.length);
        for (var i = 0; i < X.length; i++) {
            Y[i] = (1 / (1 + Math.exp(-X[i])));
        }
        return new onnxjs_1.Tensor(Y, input.type, input.dims ? input.dims : [input.data.length]);
    }
    exports.sigmoid = sigmoid;
    function exp(input) {
        if (input.type === 'string') {
            throw new Error('Unsupported type for transform');
        }
        var X = input.data;
        var Y = yoloPostprocessUtils_1.TypedArrayUtil.createTypedArray(input.type, X.length);
        for (var i = 0; i < X.length; i++) {
            Y[i] = Math.exp(X[i]);
        }
        return new onnxjs_1.Tensor(Y, input.type, input.dims ? input.dims : [input.data.length]);
    }
    exports.exp = exp;
});
