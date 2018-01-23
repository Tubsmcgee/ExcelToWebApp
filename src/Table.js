import React from 'react';
import {Cell} from './Cell.js';
import {toLongName} from './utils.js';

export const Table = ({rows, cols, cells, sheetNum, changeCell}) => {
  const tableRows = rows.map(rowNumber => {
    const rowColumns = cols.map(colLetter => {
      const cell = cells[toLongName(sheetNum, colLetter + rowNumber)];
      return (
        <td key={colLetter + rowNumber} title={cell && cell.f}>
          <Cell
            cell={cell}
            onChange={e => changeCell(cell.id, e.target.value)}
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
