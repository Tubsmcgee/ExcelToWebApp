import React, {Component} from 'react';
import xlsx from 'xlsx';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {processSheets, calculate} from './calculations.js';
import {BrowserRouter as Router, Route, NavLink} from 'react-router-dom';
import {Table} from './Table.js';
import {assocPath} from 'ramda';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {sheets: [], cells: {}};
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
    this.setState(processSheets(parsedSheets));
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

  changeCell = (id, val) => {
    const newState = assocPath(['cells', id, 'v'], val, this.state);
    // TODO CALCULATE
    // const calculatedState = assocPath(
    //   ['sheets'],
    //   calculate(newState.sheets),
    //   newState
    // );

    this.setState(newState);
  };

  render() {
    const {sheets, cells} = this.state;
    return (
      <Router>
        <div className="container">
          <input
            type="file"
            onChange={e => this.changeFile(e.target.files[0])}
          />
          <ul style={{marginBottom: '10px'}} className="nav nav-tabs">
            {sheets.map(({sheetName}) => (
              <li className="nav-item" key={sheetName}>
                <NavLink
                  activeClassName="active"
                  className="nav-link"
                  to={'/' + sheetName}
                >
                  {sheetName}
                </NavLink>
              </li>
            ))}
          </ul>
          <Route
            path="/:sheetName"
            render={({match: {params: {sheetName}}}) => {
              const sheetNum = sheets.findIndex(s => s.sheetName === sheetName);
              return (
                sheets[sheetNum] && (
                  <Table
                    rows={sheets[sheetNum].rows}
                    cols={sheets[sheetNum].cols}
                    cells={cells}
                    sheetNum={sheetNum}
                    changeCell={this.changeCell}
                  />
                )
              );
            }}
          />
        </div>
      </Router>
    );
  }
}

export default App;
