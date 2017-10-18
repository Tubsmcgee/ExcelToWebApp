import React, {Component} from 'react';
import logo from './logo.svg';
import xlsx from 'xlsx';
import './App.css';
import functions from './functions.js';

const unique = arr =>
  arr.reduce((res, v) => {
    if (!res.includes(v)) res.push(v);
    return res;
  }, []);

// const flatten = arr => arr.reduce((res, v) => res.concat(v), []);

const colToNum = letters =>
  letters.length ? letters.charCodeAt(letters.length - 1) - 64 + 26 * colToNum(letters.slice(0, -1)) : 0;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {rows: []};
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

    const rows = [];
    const cols = [];

    keys.forEach(key => {
      const cell = parsed[key];
      if (cell.f) {
        cell.vars = unique(cell.f.match(/[A-Z]\w*/g));
        cell.func = new Function(...cell.vars, `return ${cell.f};`); //eslint-disable-line
        cell.vars.forEach(v => {
          if (!parsed[v]) parsed[v] = {};
          parsed[v].isInput = true;
        });
      }

      const row = parseInt(cell.id.replace(/^[A-Z]+/g, ''), 10);
      const col = cell.id.replace(/\d/g, '');
      if (!rows.includes(row)) rows.push(row);
      if (!cols.includes(col)) cols.push(col);
    });

    rows.sort();
    cols.sort();

    console.log(parsed, rows, cols);
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
    this.setState({parsed: {...this.state.parsed, [id]: {...this.state.parsed[id], v: val}}});
  }

  render() {
    const {parsed, rows, cols} = this.state;

    const tableRows = rows.map(rowNumber => {
      const rowColumns = cols.map(colLetter => {
        const cell = parsed[colLetter + rowNumber];
        let val = '';
        if (cell && cell.func) {
          const args = cell.vars.map(
            varName =>
              functions[varName] ||
              (parsed[varName] ? +parsed[varName].v : console.error(varName, 'in', cell, 'not found'))
          );
          cell.v = cell.func(...args);
        }
        if (cell && cell.isInput) {
          val = <input type="number" value={cell.v} onChange={e => this.changeCell(cell.id, e.target.value)} />;
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
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React, dont touch my penis</h1>
          <input type="file" onChange={e => this.changeFile(e.target.files[0])} />
        </header>
        <table>
          <tbody>{tableRows}</tbody>
        </table>
      </div>
    );
  }
}

export default App;
