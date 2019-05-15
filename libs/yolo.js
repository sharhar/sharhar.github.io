// Heavily derived from YAD2K (https://github.com/ModelDepot/tfjs-yolo-tiny-demo)
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "./yolo_classes", "./yoloPostprocess", "./onnxjs"], function (require, exports, yolo_classes_1, yolo, onnxjs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.YOLO_ANCHORS = new onnxjs_1.Tensor(Float32Array.from([1.08, 1.19, 3.42, 4.41, 6.63, 11.38,
        9.42, 5.11, 16.62, 10.52]), 'float32', [5, 2]);
    var DEFAULT_FILTER_BOXES_THRESHOLD = 0.01;
    var DEFAULT_IOU_THRESHOLD = 0.4;
    var DEFAULT_CLASS_PROB_THRESHOLD = 0.3;
    var INPUT_DIM = 416;
    function postprocess(outputTensor, numClasses) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, boxXy, boxWh, boxConfidence, boxClassProbs, allBoxes, _b, outputBoxes, scores, classes, width, height, imageDims, boxes, _c, preKeepBoxesArr, scoresArr, _d, keepIndx, boxesArr, keepScores, classesIndxArr, results;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _a = yolo_head(outputTensor, exports.YOLO_ANCHORS, 20), boxXy = _a[0], boxWh = _a[1], boxConfidence = _a[2], boxClassProbs = _a[3];
                        allBoxes = yolo_boxes_to_corners(boxXy, boxWh);
                        return [4 /*yield*/, yolo_filter_boxes(allBoxes, boxConfidence, boxClassProbs, DEFAULT_FILTER_BOXES_THRESHOLD)];
                    case 1:
                        _b = _e.sent(), outputBoxes = _b[0], scores = _b[1], classes = _b[2];
                        // If all boxes have been filtered out
                        if (outputBoxes == null) {
                            return [2 /*return*/, []];
                        }
                        width = yolo.scalar(INPUT_DIM);
                        height = yolo.scalar(INPUT_DIM);
                        imageDims = yolo.reshape(yolo.stack([height, width, height, width]), [1, 4]);
                        boxes = yolo.mul(outputBoxes, imageDims);
                        return [4 /*yield*/, Promise.all([
                                boxes.data, scores.data,
                            ])];
                    case 2:
                        _c = _e.sent(), preKeepBoxesArr = _c[0], scoresArr = _c[1];
                        _d = non_max_suppression(preKeepBoxesArr, scoresArr, DEFAULT_IOU_THRESHOLD), keepIndx = _d[0], boxesArr = _d[1], keepScores = _d[2];
                        return [4 /*yield*/, yolo.gather(classes, new onnxjs_1.Tensor(keepIndx, 'int32')).data];
                    case 3:
                        classesIndxArr = _e.sent();
                        results = [];
                        classesIndxArr.forEach(function (classIndx, i) {
                            var classProb = keepScores[i];
                            if (classProb < DEFAULT_CLASS_PROB_THRESHOLD) {
                                return;
                            }
                            var className = yolo_classes_1.default[classIndx];
                            var _a = boxesArr[i], top = _a[0], left = _a[1], bottom = _a[2], right = _a[3];
                            top = Math.max(0, top);
                            left = Math.max(0, left);
                            bottom = Math.min(416, bottom);
                            right = Math.min(416, right);
                            var resultObj = {
                                className: className,
                                classProb: classProb,
                                bottom: bottom,
                                top: top,
                                left: left,
                                right: right,
                            };
                            results.push(resultObj);
                        });
                        return [2 /*return*/, results];
                }
            });
        });
    }
    exports.postprocess = postprocess;
    function yolo_filter_boxes(boxes, boxConfidence, boxClassProbs, threshold) {
        return __awaiter(this, void 0, void 0, function () {
            var boxScores, boxClasses, boxClassScores, predictionMask, N, allIndices, negIndices, indices;
            return __generator(this, function (_a) {
                boxScores = yolo.mul(boxConfidence, boxClassProbs);
                boxClasses = yolo.argMax(boxScores, -1);
                boxClassScores = yolo.max(boxScores, -1);
                predictionMask = yolo.as1D(yolo.greaterEqual(boxClassScores, yolo.scalar(threshold)));
                N = predictionMask.size;
                allIndices = yolo.cast(yolo.linspace(0, N - 1, N), 'int32');
                negIndices = yolo.zeros([N], 'int32');
                indices = yolo.where(predictionMask, allIndices, negIndices);
                return [2 /*return*/, [
                        yolo.gather(yolo.reshape(boxes, [N, 4]), indices),
                        yolo.gather(yolo.as1D(boxClassScores), indices),
                        yolo.gather(yolo.as1D(boxClasses), indices),
                    ]];
            });
        });
    }
    exports.yolo_filter_boxes = yolo_filter_boxes;
    /**
     * Given XY and WH tensor outputs of yolo_head, returns corner coordinates.
     * @param {Tensor} box_xy Bounding box center XY coordinate Tensor
     * @param {Tensor} box_wh Bounding box WH Tensor
     * @returns {Tensor} Bounding box corner Tensor
     */
    function yolo_boxes_to_corners(boxXy, boxWh) {
        var two = new onnxjs_1.Tensor([2.0], 'float32');
        var boxMins = yolo.sub(boxXy, yolo.div(boxWh, two));
        var boxMaxes = yolo.add(boxXy, yolo.div(boxWh, two));
        var dim0 = boxMins.dims[0];
        var dim1 = boxMins.dims[1];
        var dim2 = boxMins.dims[2];
        var size = [dim0, dim1, dim2, 1];
        return yolo.concat([
            yolo.slice(boxMins, [0, 0, 0, 1], size),
            yolo.slice(boxMins, [0, 0, 0, 0], size),
            yolo.slice(boxMaxes, [0, 0, 0, 1], size),
            yolo.slice(boxMaxes, [0, 0, 0, 0], size),
        ], 3);
    }
    exports.yolo_boxes_to_corners = yolo_boxes_to_corners;
    /**
     * Filters/deduplicates overlapping boxes predicted by YOLO. These
     * operations are done on CPU as AFAIK, there is no tfjs way to do it
     * on GPU yet.
     * @param {TypedArray} boxes Bounding box corner data buffer from Tensor
     * @param {TypedArray} scores Box scores data buffer from Tensor
     * @param {Number} iouThreshold IoU cutoff to filter overlapping boxes
     */
    function non_max_suppression(boxes, scores, iouThreshold) {
        // Zip together scores, box corners, and index
        var zipped = [];
        for (var i = 0; i < scores.length; i++) {
            zipped.push([
                scores[i], [boxes[4 * i], boxes[4 * i + 1], boxes[4 * i + 2], boxes[4 * i + 3]], i,
            ]);
        }
        // Sort by descending order of scores (first index of zipped array)
        var sortedBoxes = zipped.sort(function (a, b) { return b[0] - a[0]; });
        var selectedBoxes = [];
        // Greedily go through boxes in descending score order and only
        // return boxes that are below the IoU threshold.
        sortedBoxes.forEach(function (box) {
            var add = true;
            for (var i = 0; i < selectedBoxes.length; i++) {
                // Compare IoU of zipped[1], since that is the box coordinates arr
                // TODO: I think there's a bug in this calculation
                var curIou = box_iou(box[1], selectedBoxes[i][1]);
                if (curIou > iouThreshold) {
                    add = false;
                    break;
                }
            }
            if (add) {
                selectedBoxes.push(box);
            }
        });
        // Return the kept indices and bounding boxes
        return [
            selectedBoxes.map(function (e) { return e[2]; }),
            selectedBoxes.map(function (e) { return e[1]; }),
            selectedBoxes.map(function (e) { return e[0]; }),
        ];
    }
    exports.non_max_suppression = non_max_suppression;
    // Convert yolo output to bounding box + prob tensors
    function yolo_head(feats, anchors, numClasses) {
        var numAnchors = anchors.dims[0];
        var anchorsArray = yolo.reshape(anchors, [1, 1, numAnchors, 2]);
        var convDims = feats.dims.slice(1, 3);
        // For later use
        var convDims0 = convDims[0];
        var convDims1 = convDims[1];
        var convHeightIndex = yolo.range(0, convDims[0]);
        var convWidthIndex = yolo.range(0, convDims[1]);
        convHeightIndex = yolo.tile(convHeightIndex, [convDims[1]]);
        convWidthIndex = yolo.tile(yolo.expandDims(convWidthIndex, 0), [convDims[0], 1]);
        convWidthIndex = yolo.as1D(yolo.transpose(convWidthIndex));
        var convIndex = yolo.transpose(yolo.stack([convHeightIndex, convWidthIndex]));
        convIndex = yolo.reshape(convIndex, [convDims[0], convDims[1], 1, 2]);
        convIndex = yolo.cast(convIndex, feats.type);
        feats = yolo.reshape(feats, [convDims[0], convDims[1], numAnchors, numClasses + 5]);
        var convDimsTensor = yolo.cast(yolo.reshape(new onnxjs_1.Tensor(convDims, 'int32'), [1, 1, 1, 2]), feats.type);
        var boxXy = yolo.sigmoid(yolo.slice(feats, [0, 0, 0, 0], [convDims0, convDims1, numAnchors, 2]));
        var boxWh = yolo.exp(yolo.slice(feats, [0, 0, 0, 2], [convDims0, convDims1, numAnchors, 2]));
        var boxConfidence = yolo.sigmoid(yolo.slice(feats, [0, 0, 0, 4], [convDims0, convDims1, numAnchors, 1]));
        var boxClassProbs = yolo.softmax(yolo.slice(feats, [0, 0, 0, 5], [convDims0, convDims1, numAnchors, numClasses]));
        boxXy = yolo.div(yolo.add(boxXy, convIndex), convDimsTensor);
        boxWh = yolo.div(yolo.mul(boxWh, anchorsArray), convDimsTensor);
        // boxXy = tf.mul(tf.add(boxXy, convIndex), 32);
        // boxWh = tf.mul(tf.mul(boxWh, anchorsArray), 32);
        return [boxXy, boxWh, boxConfidence, boxClassProbs];
    }
    exports.yolo_head = yolo_head;
    function box_intersection(a, b) {
        var w = Math.min(a[3], b[3]) - Math.max(a[1], b[1]);
        var h = Math.min(a[2], b[2]) - Math.max(a[0], b[0]);
        if (w < 0 || h < 0) {
            return 0;
        }
        return w * h;
    }
    exports.box_intersection = box_intersection;
    function box_union(a, b) {
        var i = box_intersection(a, b);
        return (a[3] - a[1]) * (a[2] - a[0]) + (b[3] - b[1]) * (b[2] - b[0]) - i;
    }
    exports.box_union = box_union;
    function box_iou(a, b) {
        return box_intersection(a, b) / box_union(a, b);
    }
    exports.box_iou = box_iou;
});
