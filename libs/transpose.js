define(["require", "exports", "./onnxjs", "./yoloPostprocessUtils"], function (require, exports, onnxjs_1, yoloPostprocessUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function transpose(x, perm) {
        var inputDims = x.dims ? x.dims : [x.data.length];
        var rank = inputDims.length;
        // determine permutation to use
        // if no permutation was specified in the attributes,
        // the default is [rank-1, ..., 0]
        var finalPerm = new Array(rank);
        if (perm && perm.length === rank) {
            finalPerm = perm;
        }
        else {
            for (var i = 0; i < rank; i++) {
                finalPerm[i] = rank - i - 1;
            }
        }
        var outputDims = new Array(rank);
        var stride = new Array(rank);
        // determine shape of output, as well as stride to be used
        // stride[i] indicates the stride for the input-tensor dimension
        // corresponding to the i-th dimension of the output
        for (var i = 0; i < rank; i++) {
            var inpDim = finalPerm[i];
            outputDims[i] = inputDims[inpDim];
            if (inpDim + 1 < rank) {
                stride[i] = yoloPostprocessUtils_1.ShapeUtil.sizeFromDimension(inputDims, inpDim + 1);
            }
            else {
                stride[i] = 1;
            }
        }
        var output = new onnxjs_1.Tensor(yoloPostprocessUtils_1.TypedArrayUtil.createTypedArray(x.type, yoloPostprocessUtils_1.ShapeUtil.size(outputDims)), x.type, outputDims);
        var X = x.data;
        var Y = output.data;
        // partition the permutation into a prefix and the largest suffix such that
        // every axis i in the suffix is mapped to i.
        var numAxesInPrefix = 0; // number of axes in prefix
        var suffixBlocksize = 1; // product of dimensions in the suffix
        var prefixBlocksize = 1; // product of dimensions in the prefix
        var isSuffix = true;
        for (var i = rank - 1; i >= 0; --i) {
            var inpAxis = finalPerm[i];
            if (isSuffix && (inpAxis === i)) {
                suffixBlocksize *= inputDims[inpAxis];
            }
            else {
                isSuffix = false;
                prefixBlocksize *= inputDims[inpAxis];
                ++numAxesInPrefix;
            }
        }
        if (prefixBlocksize === 1) {
            doTransposeSingleBlock(suffixBlocksize, Y, X);
        }
        else if (suffixBlocksize === 1) {
            doTransposeEltWise(numAxesInPrefix, outputDims, prefixBlocksize, stride, Y, X);
        }
        else {
            doTranspose(numAxesInPrefix, outputDims, prefixBlocksize, suffixBlocksize, stride, Y, X);
        }
        return output;
    }
    exports.transpose = transpose;
    // doTranspose: copies source tensor to target, transposing elements.
    // the stride vector indicates the transposition.
    function doTranspose(numAxes, targetDims, numBlocks, numElementsInBlock, stride, target, source) {
        var targetIndex = new Array(numAxes).fill(0);
        var startSourceIndex = 0;
        var startTargetIndex = 0;
        for (var i = 0; i < numBlocks; ++i) {
            var sizeOffset = yoloPostprocessUtils_1.ShapeUtil.computeOffset(targetIndex, stride, numAxes);
            yoloPostprocessUtils_1.arrayCopyHelper(target, source, startTargetIndex, startSourceIndex + sizeOffset, numElementsInBlock);
            yoloPostprocessUtils_1.ShapeUtil.incrementIndex(targetIndex, targetDims, numAxes);
            startTargetIndex += numElementsInBlock;
        }
    }
    // doTransposeEltWise: specialization of DoTranspose for the
    // num_elts_in_block=1 case. copies source tensor to target, transposing
    // elements. The stride vector indicates the transposition.
    function doTransposeEltWise(numAxes, targetDims, numBlocks, stride, target, source) {
        var targetIndex = new Array(numAxes).fill(0);
        var startTargetIndex = 0;
        for (var i = 0; i < numBlocks; ++i) {
            var sourceOffset = yoloPostprocessUtils_1.ShapeUtil.computeOffset(targetIndex, stride, numAxes);
            target[startTargetIndex++] = source[sourceOffset];
            yoloPostprocessUtils_1.ShapeUtil.incrementIndex(targetIndex, targetDims, numAxes);
        }
    }
    // doTransposeSingleBlock: specialization of DoTranspose for the num_blocks=1
    // case. copies source tensor to target, transposing elements. The stride
    // vector indicates the transposition.
    function doTransposeSingleBlock(numElementsInBlock, target, source) {
        yoloPostprocessUtils_1.arrayCopyHelper(target, source, 0, 0, numElementsInBlock);
    }
});
