import React, {Component} from 'react';
import xlsx from 'xlsx';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {rangeReplacer} from './rangeReplacer.js';
import {unique, getRow, getCol} from './utils.js';
import {calculate} from './calculations.js';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {rows: [], cols: [], cells: {}};
  }
  componentDidMount() {
    if (localStorage.sheet) this.loadSheet(localStorage.sheet);
  }
  loadSheet(data) {
    const parsed = xlsx.read(data).Sheets.Sheet1;
    const cells = Object.keys(parsed)
      .filter(key => key[0] !== '!')
      .reduce((res, key) => {
        res[key] = parsed[key];
        res[key].id = key;
        return res;
      }, {});

    Object.keys(cells).forEach(key => {
      const cell = cells[key];
      if (cell.f) {
        cell.f = cell.f.replace(/[A-Z]\w*:[A-Z]\w*/g, rangeReplacer);
        cell.vars = unique(cell.f.match(/[A-Z]\w*/g));
        cell.func = new Function(...cell.vars, `return ${cell.f};`); // eslint-disable-line no-new-func
        // console.log(cell.func);
        cell.vars.forEach(id => {
          if (/^[A-Z]{1,2}\d+$/.test(id)) {
            if (!cells[id]) cells[id] = {id};
            if (!cells[id].f) cells[id].isInput = true;
          }
        });
      }
    });

    const rows = unique(Object.keys(cells).map(getRow)).sort((a, b) => a - b);
    const cols = unique(Object.keys(cells).map(getCol)).sort();

    this.setState({cells: calculate(cells), rows, cols});
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
      cells: calculate({
        ...this.state.cells,
        [id]: {...this.state.cells[id], v: val}
      })
    });
  }
  getCellValue(cell) {
    if (cell && cell.isInput) {
      return (
        <input
          className="form-control"
          type="number"
          value={cell.v}
          onChange={e => this.changeCell(cell.id, e.target.value)}
        />
      );
    } else if (cell) {
      return cell.v;
    }
  }
  render() {
    const {cells, rows, cols} = this.state;

    const tableRows = rows.map(rowNumber => {
      const rowColumns = cols.map(colLetter => {
        const cell = cells[colLetter + rowNumber];
        return (
          <td key={colLetter + rowNumber} title={JSON.stringify(cell)}>
            {this.getCellValue(cell)}
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
