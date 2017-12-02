import React from 'react';
import {Cell} from './Cell.js';

export const Table = ({rows, cols, cells, changeCell, sheetName}) => {
  const tableRows = rows.map(rowNumber => {
    const rowColumns = cols.map(colLetter => {
      const cell = cells[colLetter + rowNumber];
      return (
        <td key={colLetter + rowNumber} title={JSON.stringify(cell)}>
          <Cell
            cell={cell}
            onChange={e => changeCell(sheetName, cell.id, e.target.value)}
          />
        </td>
      );
    });
    return <tr key={rowNumber}>{rowColumns}</tr>;
  });
  return (
    <table className="table table-bordered">
      <tbody>{tableRows}</tbody>
    </table>
  );
};
