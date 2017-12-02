import React, {Component} from 'react';
import xlsx from 'xlsx';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {unique, getRow, getCol, setIn} from './utils.js';
import {preprocessCells, calculate} from './calculations.js';
import {BrowserRouter as Router, Link, Route} from 'react-router-dom';
import {Table} from './Table.js';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {sheets: {}};
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
    const sheets = sheetNames.reduce((res, sheetName) => {
      const sheet = parsedSheets[sheetName];
      const {cells, functionCellIds} = preprocessCells(sheet);
      const rows = unique(Object.keys(cells).map(getRow)).sort((a, b) => a - b);
      const cols = unique(Object.keys(cells).map(getCol)).sort();
      res[sheetName] = {cells, functionCellIds, rows, cols};
      return res;
    }, {});
    console.log(sheets);
    this.setState({sheets});
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

  //TODO: do calculations on cells
  changeCell = (currentSheet, id, val) => {
    const newState = setIn(
      ['sheets', currentSheet, 'cells', id, 'v'],
      val,
      this.state
    );
    const calculatedState = setIn(
      ['sheets', currentSheet, 'cells'],
      calculate(newState.sheets[currentSheet]),
      newState
    );

    this.setState(calculatedState);
  };

  render() {
    const {sheets} = this.state;

    return (
      <Router>
        <div className="container">
          <input
            type="file"
            onChange={e => this.changeFile(e.target.files[0])}
          />
          {Object.keys(sheets).map(el => (
            <Link key={el} to={'/' + el}>
              {el}
            </Link>
          ))}
          <Route
            path="/:sheetName"
            component={({match: {params: {sheetName}}}) => {
              const {cells, rows = [], cols = []} = sheets[sheetName] || {};
              return (
                <Table
                  rows={rows}
                  cols={cols}
                  cells={cells}
                  changeCell={this.changeCell}
                  sheetName={sheetName}
                />
              );
            }}
          />
        </div>
      </Router>
    );
  }
}

export default App;
