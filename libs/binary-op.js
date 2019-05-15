define(["require", "exports", "./onnxjs", "./yoloPostprocessUtils", "./ndarray"], function (require, exports, onnxjs_1, yoloPostprocessUtils_1, ndarray_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function binaryOp(x, y, opLambda, resultType) {
        var result = yoloPostprocessUtils_1.BroadcastUtil.calc(ndarray(x.data, x.dims ? x.dims.slice(0) : [x.data.length]), ndarray(y.data, y.dims ? y.dims.slice(0) : [y.data.length]), opLambda);
        if (!result) {
            throw new Error('not broadcastable');
        }
        var rType = resultType ? resultType : x.type;
        var output = new onnxjs_1.Tensor(rType === 'bool' ? Uint8Array.from(result.data) : result.data, rType, result.shape);
        return output;
    }
    exports.binaryOp = binaryOp;
});
