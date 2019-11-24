
function gpInternal_getOrthoMatrix(projMat, left, right, bottom, top, n, f) {
	projMat[0] = 2.0 / (right - left);
	projMat[1] = 0;
	projMat[2] = 0;
	projMat[3] = 0;

	projMat[4] = 0;
	projMat[5] = 2.0 / (top - bottom);
	projMat[6] = 0;
	projMat[7] = 0;

	projMat[8] = 0;
	projMat[9] = 0;
	projMat[10] = -2.0 / (f - n);
	projMat[11] = 0;

	projMat[12] = -(right + left) / (right - left);
	projMat[13] = -(top + bottom) / (top - bottom);
	projMat[14] = -(f + n) / (f - n);
	projMat[15] = 1;
}

function gpInternal_getModelviewMatrix(gridModel, x, y, w, h) {
	gridModel[0] = w;
	gridModel[1] = 0;
	gridModel[2] = 0;
	gridModel[3] = 0;

	gridModel[4] = 0;
	gridModel[5] = h;
	gridModel[6] = 0;
	gridModel[7] = 0;

	gridModel[8] = 0;
	gridModel[9] = 0;
	gridModel[10] = 1;
	gridModel[11] = 0;

	gridModel[12] = x;
	gridModel[13] = y;
	gridModel[14] = 0;
	gridModel[15] = 1;
}