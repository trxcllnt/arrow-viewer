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

type TableState = [Table | null, CellMeasurerCache];

export function useArrowTableFromFile(file: File | null): [
  React.HookState<Table> | null,
  React.HookState<CellMeasurerCache>
] {

  const [[table, cellMeasureCache], setTableAndCache] = React.useState<TableState>([
    null, new CellMeasurerCache({ defaultWidth: 100, minWidth: 20, fixedHeight: true })
  ]);

  React.useEffect(function readAndSetTable() {
    cellMeasureCache.clearAll();
    if (file) {
      Table.from(readFileStream(file)).then((table) => {
        setTableAndCache([table, cellMeasureCache]);
      })
    } else {
      setTableAndCache([null, cellMeasureCache])
    }
  }, [file]);

  return [table, cellMeasureCache];
}

async function* readFileStream(file: File) {

  let offset = 0;
  let reader = new FileReader();
  let size = yield new Uint8Array(0);

  while (offset < file.size) {
    size = yield await readNextBlob(
      reader, file.slice(offset, offset +=
        (isNaN(+size) ? file.size - offset : size)));
  }
}

function readNextBlob(reader: FileReader, blob: Blob) {
  return new Promise<Uint8Array | null>((resolve, reject) => {
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const buf = reader.result as ArrayBuffer;
      resolve(buf ? new Uint8Array(buf) : null);
    };
    reader.readAsArrayBuffer(blob);
  });
}
