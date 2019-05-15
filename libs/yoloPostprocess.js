define(["require", "exports", "./onnxjs", "./yoloPostprocessUtils", "./unary-op", "./binary-op", "./concat", "./softmax", "./transpose", "./reshape"], function (require, exports, onnxjs_1, yoloPostprocessUtils_1, unaryOps, binary_op_1, concat_1, softmax_1, transpose_1, reshape_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Utility Tensor Creators
    function as1D(t) {
        return reshape(t, [t.data.length]);
    }
    exports.as1D = as1D;
    function scalar(value, dtype) {
        if (dtype === void 0) { dtype = 'float32'; }
        if (dtype !== 'float32' && dtype !== 'int32') {
            throw new Error('Unsupported type for this transformation');
        }
        var data = yoloPostprocessUtils_1.TypedArrayUtil.createTypedArray(dtype, 1);
        data[0] = value;
        return new onnxjs_1.Tensor(data, dtype, [1]);
    }
    exports.scalar = scalar;
    function zeros(dims, dtype) {
        if (dtype === void 0) { dtype = 'float32'; }
        if (dtype !== 'float32' && dtype !== 'int32' && dtype !== 'bool') {
            throw new Error('Unsupported type for creating all zero Tensor');
        }
        yoloPostprocessUtils_1.ShapeUtil.validateDims(dims);
        return new onnxjs_1.Tensor(yoloPostprocessUtils_1.TypedArrayUtil.createTypedArray(dtype, yoloPostprocessUtils_1.ShapeUtil.size(dims)), dtype, dims);
    }
    exports.zeros = zeros;
    function linspace(start, stop, num) {
        if (num === 0) {
            throw new Error('Must request atleast one sample');
        }
        var increments = (stop - start) / (num - 1);
        var data = yoloPostprocessUtils_1.TypedArrayUtil.createTypedArray('float32', num);
        data[0] = start;
        for (var i = 1; i < data.length; i++) {
            data[i] = data[i - 1] + increments;
        }
        return new onnxjs_1.Tensor(data, 'float32', [num]);
    }
    exports.linspace = linspace;
    function range(start, stop, step, dtype) {
        if (step === void 0) { step = 1; }
        if (dtype === void 0) { dtype = 'float32'; }
        if (step === 0) {
            throw new Error('Step size of 0 is not acceptable');
        }
        // adjust default values
        if (stop < step && step === 1) {
            step = -1;
        }
        // the following conditions cannot generate any data
        if (start === step || (start < stop && step < 0) || (stop < start && step > 0)) {
            return new onnxjs_1.Tensor(yoloPostprocessUtils_1.TypedArrayUtil.createTypedArray(dtype, 1), dtype, [1]);
        }
        var size = Math.abs(Math.ceil((stop - start) / step));
        var data = yoloPostprocessUtils_1.TypedArrayUtil.createTypedArray(dtype, size);
        data[0] = start;
        for (var i = 1; i < data.length; i++) {
            data[i] = data[i - 1] + step;
        }
        return new onnxjs_1.Tensor(data, dtype, [size]);
    }
    exports.range = range;
    // Basic Math Tensor Transforms
    function sigmoid(t) {
        if (t.type !== 'float32' && t.type !== 'int32') {
            throw new Error('Unsupported type for transform');
        }
        return unaryOps.sigmoid(t);
    }
    exports.sigmoid = sigmoid;
    function exp(t) {
        if (t.type !== 'float32' && t.type !== 'int32') {
            throw new Error('Unsupported type for transform');
        }
        return unaryOps.exp(t);
    }
    exports.exp = exp;
    // Arithmetic Tensor Transforms
    function add(t1, t2) {
        if ((t1.type !== 'float32' && t1.type !== 'int32') || (t2.type !== 'float32' && t2.type !== 'int32')) {
            throw new Error('Unsupported type for transform');
        }
        if (t1.type !== t2.type) {
            throw new Error('Types are not homogeneous');
        }
        return binary_op_1.binaryOp(t1, t2, function (e1, e2) { return (e1 + e2); }, t1.type);
    }
    exports.add = add;
    function sub(t1, t2) {
        if ((t1.type !== 'float32' && t1.type !== 'int32') || (t2.type !== 'float32' && t2.type !== 'int32')) {
            throw new Error('Unsupported type for transform');
        }
        if (t1.type !== t2.type) {
            throw new Error('Types are not homogeneous');
        }
        return binary_op_1.binaryOp(t1, t2, function (e1, e2) { return (e1 - e2); }, t1.type);
    }
    exports.sub = sub;
    function mul(t1, t2) {
        if ((t1.type !== 'float32' && t1.type !== 'int32') || (t2.type !== 'float32' && t2.type !== 'int32')) {
            throw new Error('Unsupported type for transform');
        }
        if (t1.type !== t2.type) {
            throw new Error('Types are not homogeneous');
        }
        return binary_op_1.binaryOp(t1, t2, function (e1, e2) { return (e1 * e2); }, t1.type);
    }
    exports.mul = mul;
    function div(t1, t2) {
        if ((t1.type !== 'float32' && t1.type !== 'int32') || (t2.type !== 'float32' && t2.type !== 'int32')) {
            throw new Error('Unsupported type for transform');
        }
        if (t1.type !== t2.type) {
            throw new Error('Types are not homogeneous');
        }
        // TODO: Handle division by zero if any
        return binary_op_1.binaryOp(t1, t2, function (e1, e2) { return (e1 / e2); }, t1.type);
    }
    exports.div = div;
    // Normalization Tensor Transforms
    function softmax(t, dim) {
        if (dim === void 0) { dim = -1; }
        if (t.type !== 'float32' && t.type !== 'int32') {
            throw new Error('Unsupported type for transform');
        }
        return softmax_1.softmax(t, dim);
    }
    exports.softmax = softmax;
    // Slice And Join Tensor Transforms
    function concat(tensors, axis, typeCheckRequired) {
        if (axis === void 0) { axis = 0; }
        if (typeCheckRequired === void 0) { typeCheckRequired = true; }
        if (tensors.length < 2) {
            throw new Error('Must have atleast 2 tensors to concatenate');
        }
        if (typeCheckRequired) {
            var types_1 = [];
            tensors.forEach(function (t) {
                types_1.push(t.type);
            });
            yoloPostprocessUtils_1.TypeUtil.validateSameTypes(types_1);
        }
        return concat_1.concat(tensors, axis);
    }
    exports.concat = concat;
    function stack(tensors, axis) {
        if (axis === void 0) { axis = 0; }
        if (tensors.length < 2) {
            throw new Error('Must have atleast 2 tensors to stack');
        }
        var types = [];
        var shapes = [];
        tensors.forEach(function (t) {
            types.push(t.type);
            shapes.push(t.dims ? t.dims : [t.data.length]);
        });
        yoloPostprocessUtils_1.TypeUtil.validateSameTypes(types);
        yoloPostprocessUtils_1.ShapeUtil.validateEqualDims(shapes);
        var rank = tensors[0].dims ? tensors[0].dims.length : 1;
        axis = yoloPostprocessUtils_1.ShapeUtil.getActualAxisFromNegativeValue(axis, rank);
        var expanded = tensors.map(function (t) { return expandDims(t, axis); });
        return concat(expanded, axis, false);
    }
    exports.stack = stack;
    function gather(t, indices, axis) {
        if (axis === void 0) { axis = 0; }
        if (t.type === 'string') {
            throw new Error('Unspported type for this transformation');
        }
        if (indices.type !== 'int32' || (indices.dims && indices.dims.length > 1)) {
            throw new Error('Indices tensor not of specified format');
        }
        var dims = t.dims ? t.dims.slice() : [t.data.length];
        var newDims = dims;
        var indicesData = indices.data;
        newDims[axis] = indicesData.length;
        var dimsStrides = yoloPostprocessUtils_1.ShapeUtil.computeStrides(dims);
        var newDimsStrides = yoloPostprocessUtils_1.ShapeUtil.computeStrides(newDims);
        var Y = yoloPostprocessUtils_1.TypedArrayUtil.createTypedArray(t.type, yoloPostprocessUtils_1.ShapeUtil.size(newDims));
        var X = t.data;
        for (var i = 0; i < Y.length; ++i) {
            var newLogicalIndex = yoloPostprocessUtils_1.ShapeUtil.offsetToIndices(i, newDimsStrides);
            var oldLogicalIndex = newLogicalIndex.slice();
            oldLogicalIndex[axis] = indicesData[newLogicalIndex[axis]];
            var oldOffset = yoloPostprocessUtils_1.ShapeUtil.indicesToOffset(oldLogicalIndex, dimsStrides);
            Y[i] = X[oldOffset];
        }
        return new onnxjs_1.Tensor(Y, t.type, newDims);
    }
    exports.gather = gather;
    function slice(t, begin, size) {
        if (t.type === 'string') {
            throw new Error('Unspported type for this transformation');
        }
        var newDimsStride = yoloPostprocessUtils_1.ShapeUtil.computeStrides(size);
        var oldDimsStride = yoloPostprocessUtils_1.ShapeUtil.computeStrides(t.dims ? t.dims : [t.data.length]);
        var X = t.data;
        var Y = yoloPostprocessUtils_1.TypedArrayUtil.createTypedArray(t.type, yoloPostprocessUtils_1.ShapeUtil.size(size));
        for (var i = 0; i < Y.length; ++i) {
            var newLogicalIndex = yoloPostprocessUtils_1.ShapeUtil.offsetToIndices(i, newDimsStride);
            var oldLogicalIndex = newLogicalIndex.map(function (idx, j) { return idx + begin[j]; });
            var oldOffset = yoloPostprocessUtils_1.ShapeUtil.indicesToOffset(oldLogicalIndex, oldDimsStride);
            Y[i] = X[oldOffset];
        }
        return new onnxjs_1.Tensor(Y, t.type, size);
    }
    exports.slice = slice;
    function tile(t, reps) {
        if (t.type === 'string') {
            throw new Error('Unspported type for this transformation');
        }
        var dims = t.dims ? t.dims : [t.data.length];
        var rank = dims.length;
        var newDims = new Array(rank);
        if (rank !== reps.length) {
            throw new Error('Repetitions must be of the same rank as input dims');
        }
        for (var i = 0; i < rank; i++) {
            newDims[i] = dims[i] * reps[i];
        }
        var dimsStrides = yoloPostprocessUtils_1.ShapeUtil.computeStrides(dims);
        var newDimsStrides = yoloPostprocessUtils_1.ShapeUtil.computeStrides(newDims);
        var Y = yoloPostprocessUtils_1.TypedArrayUtil.createTypedArray(t.type, yoloPostprocessUtils_1.ShapeUtil.size(newDims));
        var X = t.data;
        for (var i = 0; i < Y.length; ++i) {
            var newLogicalIndex = yoloPostprocessUtils_1.ShapeUtil.offsetToIndices(i, newDimsStrides);
            var oldLogicalIndex = new Array(rank);
            for (var j = 0; j < rank; ++j) {
                oldLogicalIndex[j] = newLogicalIndex[j] % t.dims[j];
            }
            var oldOffset = yoloPostprocessUtils_1.ShapeUtil.indicesToOffset(oldLogicalIndex, dimsStrides);
            Y[i] = X[oldOffset];
        }
        return new onnxjs_1.Tensor(Y, t.type, newDims);
    }
    exports.tile = tile;
    // Permutation Tensor Transforms
    function transpose(t, perm) {
        return transpose_1.transpose(t, perm);
    }
    exports.transpose = transpose;
    // Shape Tensor Transforms
    function expandDims(t, axis) {
        if (axis === void 0) { axis = 0; }
        axis = yoloPostprocessUtils_1.ShapeUtil.getActualAxisFromNegativeValue(axis, t.dims ? t.dims.length : 1);
        var dims = t.dims ? t.dims : [t.data.length];
        var changedShapeLength = dims.length + 1;
        var changedShape = new Array(changedShapeLength);
        var iter = 0;
        for (var i = 0; i < changedShapeLength; ++i) {
            if (i === axis) {
                changedShape[i] = 1;
            }
            else {
                changedShape[i] = dims[iter++];
            }
        }
        return new onnxjs_1.Tensor(t.data, t.type, changedShape);
    }
    exports.expandDims = expandDims;
    // Logical Tensor Transforms
    function greaterEqual(t1, t2) {
        if ((t1.type !== 'float32' && t1.type !== 'int32' && t1.type !== 'bool')
            || (t2.type !== 'float32' && t2.type !== 'int32' && t2.type !== 'bool')) {
            throw new Error('Unsupported type for transform');
        }
        if (t1.type !== t2.type) {
            throw new Error('Types are not homogeneous');
        }
        return binary_op_1.binaryOp(t1, t2, function (e1, e2) { return (e1 >= e2 ? 1 : 0); }, 'bool');
    }
    exports.greaterEqual = greaterEqual;
    function where(condition, t1, t2) {
        // validate shape and types of input tensors and condition tensor
        yoloPostprocessUtils_1.ShapeUtil.areEqual(t1.dims ? t1.dims : [t1.data.length], t2.dims ? t2.dims : [t2.data.length]);
        yoloPostprocessUtils_1.TypeUtil.validateSameTypes([t1.type, t2.type]);
        if (condition.type !== 'bool') {
            throw new Error('Condition tensor must be bool type');
        }
        // create output
        var outputShape = t1.dims ? t1.dims : [t1.data.length];
        var output = new onnxjs_1.Tensor(yoloPostprocessUtils_1.TypedArrayUtil.createTypedArray(t1.type, yoloPostprocessUtils_1.ShapeUtil.size(outputShape)), t1.type, outputShape);
        var outputData = output.data;
        // input data
        var conditionData = condition.data;
        var X = t1.data;
        var Y = t2.data;
        // condition is 1D rank
        if (!condition.dims || condition.dims.length === 1) {
            // the outermost dimension of the input tensors and condition tensor must be the same
            var conditionDims = condition.dims ? condition.dims : [condition.data.length];
            var t1Dims = t1.dims ? t1.dims : [t1.data.length];
            if (conditionDims[0] !== t1Dims[0]) {
                throw new Error('Outermost dimensions of input tensors and condition tensor must match');
            }
            var offset = 1;
            // Input tensors are not 1-D. Need to compute offset.
            if (t1.dims && t1.dims.length > 1) {
                for (var i = 1; i < t1.dims.length; ++i) {
                    offset *= t1.dims[i];
                }
            }
            for (var i = 0; i < conditionData.length; ++i) {
                for (var j = 0; j < offset; ++j) {
                    outputData[i * offset + j] = conditionData[i] > 0 ? X[i * offset + j] : Y[i * offset + j];
                }
            }
        }
        else {
            // The shapes of input tensors and condition tensor must be the same
            yoloPostprocessUtils_1.ShapeUtil.areEqual(condition.dims, t2.dims ? t2.dims : [t2.data.length]);
            for (var i = 0; i < conditionData.length; ++i) {
                outputData[i] = conditionData[i] > 0 ? X[i] : Y[i];
            }
        }
        return output;
    }
    exports.where = where;
    // Cast Tensor Transforms
    function cast(t, dtype) {
        // TODO: If the requested type and the given type are the same, return same tensor ?
        // Need to investigate if it breaks some basic assumptions
        switch (dtype) {
            case 'int32':
                return new onnxjs_1.Tensor(Int32Array.from(t.data), 'int32', t.dims ? t.dims : [t.data.length]);
            case 'float32':
                return new onnxjs_1.Tensor(Float32Array.from(t.data), 'float32', t.dims ? t.dims : [t.data.length]);
            case 'bool':
                return new onnxjs_1.Tensor(Uint8Array.from(t.data), 'bool', t.dims ? t.dims : [t.data.length]);
            default:
                throw new Error('Unsupported type for casting');
        }
    }
    exports.cast = cast;
    function reshape(t, dims) {
        return reshape_1.reshape(t, dims);
    }
    exports.reshape = reshape;
    // Reduction Tensor Transforms
    function argMax(t, axis) {
        if (axis === void 0) { axis = 0; }
        if (t.type !== 'float32' && t.type !== 'int32') {
            throw new Error('Unsupported type for transform');
        }
        var rank = t.dims ? t.dims.length : 1;
        axis = yoloPostprocessUtils_1.ShapeUtil.getActualAxisFromNegativeValue(axis, rank);
        var _a = yoloPostprocessUtils_1.ShapeUtil.splitDimsIntoTwo(t.dims ? t.dims : [t.data.length], axis), reduceDims = _a[0], resultDims = _a[1];
        var X = t.data;
        var Y = yoloPostprocessUtils_1.TypedArrayUtil.createTypedArray('int32', resultDims.length === 0 ? 1 : yoloPostprocessUtils_1.ShapeUtil.size(resultDims));
        var blockSize = reduceDims[0];
        for (var i = 0; i < Y.length; ++i) {
            var offset = blockSize * i;
            var max_1 = X[offset];
            var index = 0;
            for (var j = 0; j < blockSize; ++j) {
                var value = X[offset + j];
                if (value > max_1) {
                    max_1 = value;
                    index = j;
                }
            }
            Y[i] = index;
        }
        return new onnxjs_1.Tensor(Y, 'int32', resultDims.length === 0 ? [1] : resultDims);
    }
    exports.argMax = argMax;
    function max(t, axis, keepDims) {
        if (axis === void 0) { axis = 0; }
        if (keepDims === void 0) { keepDims = false; }
        if (t.type !== 'float32' && t.type !== 'int32') {
            throw new Error('Unsupported type for transform');
        }
        var rank = t.dims ? t.dims.length : 1;
        axis = yoloPostprocessUtils_1.ShapeUtil.getActualAxisFromNegativeValue(axis, rank);
        var _a = yoloPostprocessUtils_1.ShapeUtil.splitDimsIntoTwo(t.dims ? t.dims : [t.data.length], axis), reduceDims = _a[0], resultDims = _a[1];
        var X = t.data;
        var Y = yoloPostprocessUtils_1.TypedArrayUtil.createTypedArray(t.type, resultDims.length === 0 ? 1 : yoloPostprocessUtils_1.ShapeUtil.size(resultDims));
        var blockSize = reduceDims[0];
        for (var i = 0; i < Y.length; ++i) {
            var offset = blockSize * i;
            var max_2 = X[offset];
            for (var j = 0; j < blockSize; ++j) {
                var value = X[offset + j];
                if (value > max_2) {
                    max_2 = value;
                }
            }
            Y[i] = max_2;
        }
        var adjustedResultDims = [];
        if (keepDims) {
            var origDims = t.dims ? t.dims : [t.data.length];
            for (var i = 0; i < origDims.length; ++i) {
                if (i === axis) {
                    adjustedResultDims.push(1);
                }
                else {
                    adjustedResultDims.push(origDims[i]);
                }
            }
        }
        else {
            adjustedResultDims = resultDims;
        }
        return new onnxjs_1.Tensor(Y, t.type, adjustedResultDims.length === 0 ? [1] : adjustedResultDims);
    }
    exports.max = max;
});
