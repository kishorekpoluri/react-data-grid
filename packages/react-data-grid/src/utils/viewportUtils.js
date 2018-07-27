import * as columnUtils from '../ColumnUtils';

export const SCROLL_DIRECTION = {
  UP: 'upwards',
  DOWN: 'downwards',
  LEFT: 'left',
  RIGHT: 'right'
}

const min = Math.min;
const max = Math.max;
const ceil = Math.ceil;

function getGridState(props) {
  const totalNumberColumns = columnUtils.getSize(props.columnMetrics.columns);
  const canvasHeight = props.minHeight - props.rowOffsetHeight;
  const renderedRowsCount = ceil((props.minHeight - props.rowHeight) / props.rowHeight);
  const totalRowCount = min(renderedRowsCount * 4, props.rowsCount);
  return {
    rowOverscanStartIdx: 0,
    rowOverscanEndIdx: totalRowCount,
    rowVisibleStartIdx: 0,
    rowVisibleEndIdx: totalRowCount,
    height: canvasHeight,
    scrollTop: 0,
    scrollLeft: 0,
    colVisibleStartIdx: 0,
    colVisibleEndIdx: totalNumberColumns,
    colOverscanStartIdx: 0,
    colOverscanEndIdx: totalNumberColumns
  };
}

function getRenderedColumnCount(props, getDOMNodeOffsetWidth, rowOverscanStartIdx, width) {
  let remainingWidth = width && width > 0 ? width : props.columnMetrics.totalWidth;
  if (remainingWidth === 0) {
    remainingWidth = getDOMNodeOffsetWidth();
  }
  let columnIndex = rowOverscanStartIdx;
  let columnCount = 0;
  while (remainingWidth > 0) {
    let column = columnUtils.getColumn(props.columnMetrics.columns, columnIndex);

    if (!column) {
      break;
    }

    columnCount++;
    columnIndex++;
    remainingWidth -= column.width;
  }
  return columnCount;
}

function getVisibleColStart(props, scrollLeft) {
  let remainingScroll = scrollLeft;
  let columnIndex = -1;
  while (remainingScroll >= 0) {
    columnIndex++;
    remainingScroll -= columnUtils.getColumn(props.columnMetrics.columns, columnIndex).width;
  }
  return columnIndex;
}

export const getVisibleBoundaries = (gridHeight, rowHeight, scrollTop, totalNumberRows) => {
  const renderedRowsCount = ceil(gridHeight / rowHeight);
  const rowVisibleStartIdx = max(0, Math.round(scrollTop / rowHeight));
  const rowVisibleEndIdx  = min(rowVisibleStartIdx  + renderedRowsCount, totalNumberRows);
  return { rowVisibleStartIdx , rowVisibleEndIdx  };
};


const getScrollDirection = (lastScroll, scrollTop, scrollLeft) => {
  if (scrollTop !== lastScroll.scrollTop) {
    return scrollTop - lastScroll.scrollTop >= 0 ? SCROLL_DIRECTION.DOWN : SCROLL_DIRECTION.UP;
  }
  if (scrollLeft !== lastScroll.scrollLeft) {
    return scrollLeft - lastScroll.scrollLeft >= 0 ? SCROLL_DIRECTION.RIGHT : SCROLL_DIRECTION.LEFT;
  }
}

const OVERSCAN_ROWS = 8;
const OVERSCAN_COLUMNS = 8;

const getRowOverscanStartIdx = (scrollDirection, rowVisibleStartIdx) => {
  return scrollDirection === SCROLL_DIRECTION.UP ? max(0, rowVisibleStartIdx - OVERSCAN_ROWS) : rowVisibleStartIdx;
}

const getRowOverscanEndIdx = (scrollDirection, rowVisibleEndIdx, totalNumberRows) => {
  const overscanBoundaryIdx = rowVisibleEndIdx + OVERSCAN_ROWS;
  return scrollDirection === SCROLL_DIRECTION.DOWN ? min(overscanBoundaryIdx, totalNumberRows) : rowVisibleEndIdx;
}

const getColOverscanStartIdx = (scrollDirection, colVisibleStartIdx) => {
  return scrollDirection === SCROLL_DIRECTION.LEFT ? max(0, colVisibleStartIdx - OVERSCAN_COLUMNS) : colVisibleStartIdx;
}

const getColOverscanEndIdx = (scrollDirection, colVisibleEndIdx, totalNumberColumns) => {
  const overscanBoundaryIdx = colVisibleEndIdx + OVERSCAN_COLUMNS;
  return scrollDirection === SCROLL_DIRECTION.RIGHT ? min(overscanBoundaryIdx, totalNumberColumns) : colVisibleEndIdx;
}


function getNextScrollState(props, lastScroll, getDOMNodeOffsetWidth, scrollTop, scrollLeft, height, rowHeight, totalNumberRows, width) {
  const isScrolling = true;
  const scrollDirection = getScrollDirection(lastScroll, scrollTop, scrollLeft);
  const { rowVisibleStartIdx , rowVisibleEndIdx  } = getVisibleBoundaries(height, rowHeight, scrollTop, totalNumberRows);
  const rowOverscanStartIdx = getRowOverscanStartIdx(scrollDirection, rowVisibleStartIdx);
  const rowOverscanEndIdx = getRowOverscanEndIdx(scrollDirection, rowVisibleEndIdx, totalNumberRows);
  const totalNumberColumns = columnUtils.getSize(props.columnMetrics.columns);
  const colVisibleStartIdx = (totalNumberColumns > 0) ? max(0, getVisibleColStart(props, scrollLeft)) : 0;
  const renderedColumnCount = getRenderedColumnCount(props, getDOMNodeOffsetWidth, colVisibleStartIdx, width);
  const colVisibleEndIdx = (renderedColumnCount !== 0) ? colVisibleStartIdx + renderedColumnCount : totalNumberColumns;
  const colOverscanStartIdx = getColOverscanStartIdx(scrollDirection, colVisibleStartIdx);
  const colOverscanEndIdx = getColOverscanEndIdx(scrollDirection, colVisibleEndIdx, totalNumberColumns);

  return {
    height,
    scrollTop,
    scrollLeft,
    rowVisibleStartIdx,
    rowVisibleEndIdx,
    rowOverscanStartIdx,
    rowOverscanEndIdx,
    colVisibleStartIdx,
    colVisibleEndIdx,
    colOverscanStartIdx,
    colOverscanEndIdx,
    scrollDirection,
    isScrolling
  };
}

export {
  getGridState,
  getNextScrollState,
  getRenderedColumnCount
};
