import React from 'react';
export const Cell = ({cell, onChange}) => {
  if (cell && cell.isInput) {
    return (
      <input
        className="form-control"
        type="number"
        value={cell.v}
        onChange={onChange}
      />
    );
  } else if (cell) {
    return cell.v;
  }
  return '';
};
