import * as React from 'react';
import * as Arrow from 'apache-arrow';
import { valueToString } from 'apache-arrow/util/pretty';

import 'react-virtualized/styles.css';
import * as ReactVirtualized from 'react-virtualized';
import { MultiGrid, CellMeasurer, CellMeasurerCache } from 'react-virtualized';

import { useWindowSize } from './hooks/useWindowSize';
import { useArrowTableFromFileInput } from './hooks/useArrowTable';

export function App() {

  const [size] = useWindowSize();
  const [table, cellMeasurerCache, fileInput] = useArrowTableFromFileInput();

  return (
    <>
      <input {...fileInput}></input>
      {!table ? undefined : 
        <ArrowTableGrid
          table={table}
          width={size.width-4}
          height={size.height-24}
          cellMeasurerCache={cellMeasurerCache}
          />
      }
    </>
  );
}

interface ArrowTableGridProps extends Partial<ReactVirtualized.MultiGridProps> {
  width: number;
  height: number;
  rowHeight?: number;
  headerHeight?: number;
  table?: Arrow.Table | null;
  cellMeasurerCache?: CellMeasurerCache | null;
}

function ArrowTableGrid({ table, width, height, cellMeasurerCache, rowHeight = 28, headerHeight = 25, ...props }: ArrowTableGridProps): JSX.Element {
  return (
    <MultiGrid
      fixedRowCount={1}
      fixedColumnCount={1}
      width={width}
      height={height}
      rowHeight={rowHeight}
      headerHeight={headerHeight}
      rowCount={(table ? (table.length + 1) : 0)}
      deferredMeasurementCache={cellMeasurerCache!}
      columnCount={(table ? (table.schema.fields.length + 1) : 0)}
      cellRenderer={cellRenderer.bind(0, table!, cellMeasurerCache!)}
      columnWidth={cellMeasurerCache && cellMeasurerCache.columnWidth || 100}
      {...props}
      />
  );
}

const cellRenderer = (
    table: Arrow.Table, cellMeasurerCache: CellMeasurerCache,
    { key, style, rowIndex, columnIndex, parent }: ReactVirtualized.GridCellProps
) => {
  let str;
  style = { ...style, whiteSpace: 'nowrap' };
  if (!table || (columnIndex === 0 && rowIndex === 0)) {
    str = '';
  } else if (columnIndex === 0) {
    str = `${rowIndex - 1}`;
  } else if (rowIndex === 0) {
    str = `${table.schema.fields[columnIndex - 1]}`;
  } else {
    style.textAlign = 'right';
    let row = table.get(rowIndex - 1);
    let val = row.get(columnIndex - 1);
    str = valueToString(val);
  }
  return (
    <CellMeasurer
      key={key}
      parent={parent}
      rowIndex={rowIndex}
      cache={cellMeasurerCache}
      columnIndex={columnIndex}>
      <div key={key} style={style}><span style={{padding: 5}}>{str}</span></div>
    </CellMeasurer>
  );
};
