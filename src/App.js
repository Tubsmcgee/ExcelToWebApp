import React, {Component} from 'react';
import logo from './logo.svg';
import xlsx from 'xlsx';
import './App.css';
import testSheet from './testFile.js';

const isDevelopmentMode = window.location.search.includes('dev');

const unique = arr =>
  arr.reduce((res, v) => {
    if (!res.includes(v)) res.push(v);
    return res;
  }, []);

// const flatten = arr => arr.reduce((res, v) => res.concat(v), []);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {rows: []};
  }
  componentDidMount() {
    if (isDevelopmentMode) this.loadSheet(testSheet);
  }
  loadSheet(data) {
    const parsed = xlsx.read(data).Sheets.Sheet1;
    const cells = Object.keys(parsed)
      .filter(key => key[0] !== '!')
      .map(key => {
        parsed[key].id = key;
        return parsed[key];
      });

    cells.forEach(cell => {
      if (cell.f) {
        cell.vars = unique(cell.f.match(/[A-Z]\w*/g));
        cell.func = new Function(...cell.vars, `return ${cell.f};`); // this is slightly dangerous
        cell.vars.forEach(v => {
          if (!parsed[v]) parsed[v] = {};
          parsed[v].isInput = true;
        });
      }
    });

    const rows = [];
    for (let row = 0; row < 26; row++) {
      rows[row] = [];
      for (let col = 0; col < 26; col++) {
        const key = String.fromCharCode(col + 65) + (row + 1);
        if (parsed[key]) rows[row][col] = parsed[key];
      }
    }

    console.log(parsed);
    this.setState({rows, parsed});
  }
  changeFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      this.loadSheet(btoa(e.target.result));
    };
    reader.readAsBinaryString(file);
  }
  changeCell(id, val) {
    console.log(this.state.parsed);
    this.setState({parsed: {...this.state.parsed, [id]: {...this.state.parsed[id], v: val}}});
  }

  render() {
    const rows = this.state.rows.map((row, i) => (
      <tr key={i}>
        {row.map((col, j) => (
          <td key={j} title={JSON.stringify(col)}>
            {col ? (
              col.isInput ? (
                <input type="number" value={col.v} onChange={e => this.changeCell(col.id, e.target.value)} />
              ) : (
                col.v
              )
            ) : (
              ''
            )}
          </td>
        ))}
      </tr>
    ));
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React, dont touch my penis</h1>
          <input type="file" onChange={e => this.changeFile(e.target.files[0])} />
        </header>
        <table>
          <tbody>{rows}</tbody>
        </table>
      </div>
    );
  }
}

export default App;
