export const extendAxisView = (echart, axisGroupCallback) => {
  const Grid = require('echarts/lib/coord/cartesian/Grid');
  const CoordinateSystem = require('echarts/lib/CoordinateSystem');

  const gridProto = Grid.prototype;

  var axisHelper = require('echarts/lib/coord/axisHelper');
  var estimateLabelUnionRect = axisHelper.estimateLabelUnionRect;

  const resize = function(gridModel, api, ignoreContainLabel) {
    if (axisGroupCallback) {
      axisGroupCallback(this._axesList, gridModel, estimateLabelUnionRect);
    }
    return this._resize(gridModel, api, ignoreContainLabel);
  };

  if (!gridProto._resize) {
    const _originalResize = gridProto.resize;
    gridProto._resize = _originalResize;
  }

  gridProto.resize = resize;
};
