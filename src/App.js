import React, {Component} from 'react';
import xlsx from 'xlsx';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {unique, getRow, getCol} from './utils.js';
import {preprocessCells, calculate} from './calculations.js';
import {Cell} from './Cell.js';
import {BrowserRouter as Router, Link} from 'react-router-dom';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {rows: [], cols: [], cells: {}, sheetNames: []};
  }
  componentDidMount() {
    try {
      if (localStorage.sheet) this.loadSheet(localStorage.sheet);
    } catch (e) {
      console.log(e);
    }
  }
  loadSheet(data) {
    const parsedSheets = xlsx.read(data).Sheets;
    const sheetNames = Object.keys(parsedSheets);
    const parsed = parsedSheets[sheetNames[0]];
    const {cells, functionCellIds} = preprocessCells(parsed);

    const rows = unique(Object.keys(cells).map(getRow)).sort((a, b) => a - b);
    const cols = unique(Object.keys(cells).map(getCol)).sort();

    this.setState({cells, rows, cols, functionCellIds, sheetNames});
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
      cells: calculate(
        {
          ...this.state.cells,
          [id]: {...this.state.cells[id], v: val}
        },
        this.state.functionCellIds
      )
    });
  }
  render() {
    const {cells, rows, cols, sheetNames} = this.state;

    const tableRows = rows.map(rowNumber => {
      const rowColumns = cols.map(colLetter => {
        const cell = cells[colLetter + rowNumber];
        return (
          <td key={colLetter + rowNumber} title={JSON.stringify(cell)}>
            <Cell
              cell={cell}
              onChange={e => this.changeCell(cell.id, e.target.value)}
            />
          </td>
        );
      });
      return <tr key={rowNumber}>{rowColumns}</tr>;
    });

    return (
      <Router>
        <div className="container">
          <input
            type="file"
            onChange={e => this.changeFile(e.target.files[0])}
          />
          {sheetNames.map(el => (
            <Link key={el} to={'/' + el}>
              {el}
            </Link>
          ))}
          <table className="table table-bordered">
            <tbody>{tableRows}</tbody>
          </table>
        </div>
      </Router>
    );
  }
}

export default App;
