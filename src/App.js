import React, {Component} from 'react';
import xlsx from 'xlsx';
import './App.css';
import functions from './functions.js';
import 'bootstrap/dist/css/bootstrap.css';
import {rangeReplacer} from './rangeReplacer.js';
import {getRowCol, unique} from './utils.js';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {rows: []}; // TODO: set correct initial state
  }
  componentDidMount() {
    if (localStorage.sheet) this.loadSheet(localStorage.sheet);
  }
  loadSheet(data) {
    const parsed = xlsx.read(data).Sheets.Sheet1;
    const keys = Object.keys(parsed).filter(key => key[0] !== '!');

    keys.forEach(key => {
      parsed[key].id = key;
    });

    //TODO: add a catch to prevent functions being designated as inputs
    keys.forEach(key => {
      const cell = parsed[key];
      if (cell.f) {
        cell.f = cell.f.replace(/[A-Z]\w*:[A-Z]\w*/g, rangeReplacer);
        cell.vars = unique(cell.f.match(/[A-Z]\w*/g));
        cell.func = new Function(...cell.vars, `return ${cell.f};`); //eslint-disable-line
        console.log(cell.func);
        cell.vars.forEach(id => {
          if (!parsed[id]) keys[id] = parsed[id] = {id};
          parsed[id].isInput = true;
        });
      }
    });

    const rows = [];
    const cols = [];
    console.log(parsed);

    keys.forEach(key => {
      const cell = parsed[key];
      const {row, col} = getRowCol(cell.id);
      if (!rows.includes(row)) rows.push(row);
      if (!cols.includes(col)) cols.push(col);
    });

    rows.sort((a, b) => a - b);
    cols.sort();

    // TODO: store object without !keys, call it something better than "parsed"
    this.setState({parsed, rows, cols});
  }
  changeFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const data = btoa(e.target.result);
      localStorage.sheet = data;
      this.loadSheet(data);
    };
    reader.readAsBinaryString(file);
  }
  changeCell(id, val) {
    this.setState({
      parsed: {...this.state.parsed, [id]: {...this.state.parsed[id], v: val}}
    });
  }

  render() {
    const {parsed, rows, cols} = this.state;

    const tableRows = rows.map(rowNumber => {
      const rowColumns = cols.map(colLetter => {
        const cell = parsed[colLetter + rowNumber];

        // TODO: don't do this during render
        if (cell && cell.func) {
          const args = cell.vars.map(
            varName =>
              functions[varName] ||
              (parsed[varName]
                ? +parsed[varName].v
                : console.error(varName, 'in', cell, 'not found'))
          );
          cell.v = cell.func(...args);
        }

        // TODO: make a getCellValue function
        let val = '';
        if (cell && cell.isInput) {
          val = (
            <input
              className="form-control"
              type="number"
              value={cell.v}
              onChange={e => this.changeCell(cell.id, e.target.value)}
            />
          );
        } else if (cell) {
          val = cell.v;
        }
        return (
          <td key={colLetter + rowNumber} title={JSON.stringify(cell)}>
            {val}
          </td>
        );
      });
      return <tr key={rowNumber}>{rowColumns}</tr>;
    });

    return (
      <div className="container">
        <input type="file" onChange={e => this.changeFile(e.target.files[0])} />
        <table className="table table-bordered">
          <tbody>{tableRows}</tbody>
        </table>
      </div>
    );
  }
}

export default App;
