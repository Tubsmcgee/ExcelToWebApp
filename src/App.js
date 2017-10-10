import React, {Component} from 'react';
import logo from './logo.svg';
import xlsx from 'xlsx';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {rows: []};
  }
  changeFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const data = btoa(e.target.result);
      const parsed = xlsx.read(data).Sheets.Sheet1;
      const rows = [];
      for (let row = 0; row < 26; row++) {
        rows[row] = [];
        for (let col = 0; col < 26; col++) {
          const key = String.fromCharCode(col + 65) + (row + 1);
          if (parsed[key]) rows[row][col] = parsed[key];
        }
      }
      this.setState({rows});
      console.log(parsed);
    };
    reader.readAsBinaryString(file);
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React, dont touch my penis</h1>
          <input type="file" onChange={e => this.changeFile(e.target.files[0])} />
        </header>
        <table>
          <tbody>
            {this.state.rows.map((row, i) => (
              <tr key={i}>
                {row.map((col, j) => (
                  <td key={j} title={JSON.stringify(col)}>
                    {col ? col.v : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default App;
