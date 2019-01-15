import * as React from 'react';
import { Table } from 'apache-arrow';
import { useInputFile } from './useInputFile';
import { CellMeasurerCache } from 'react-virtualized';

export function useArrowTableFromFileInput(): [
   React.HookState<Table> | null,
   React.HookState<CellMeasurerCache> | null,
   React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
] {
  const [file, fileInput] = useInputFile();
  const [table, cellMeasureCache] = useArrowTableFromFile(file);
  return [table, cellMeasureCache, fileInput];
}

export function useArrowTableFromFile(file: File | null): [
  React.HookState<Table> | null,
  React.HookState<CellMeasurerCache> | null
] {
  const [[table, cellMeasureCache], setTableAndCache] = React.useState<[Table | null, CellMeasurerCache | null] | null>([null, null]);
  const fileReader = React.useMemo(() => {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
      const array = new Uint8Array((event.target as any).result);
      const table = Table.from([array])
      const cellMeasureCache = new CellMeasurerCache({
        defaultWidth: 100, minWidth: 20, fixedHeight: true
      });
      setTableAndCache([table, cellMeasureCache]);
    };
    return fileReader;
  }, []);

  React.useEffect(function readAndSetTable() {
    if (file) {
      fileReader.readAsArrayBuffer(file);
    }
    else {
      setTableAndCache([null, null]);
    }
  }, [file]);

  return [table, cellMeasureCache];
}