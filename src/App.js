import React, { Component } from 'react';
import logo from './logo.svg';
import xlsx from 'xlsx';
import './App.css';

class App extends Component {
  changeFile(e){
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e)=>{
      const data = btoa(e.target.result);
      const parsed = xlsx.read(data);
      console.log(parsed);
    }
    reader.readAsBinaryString(file);
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React, don't touch my penis</h1>
          <input type="file" onChange={this.changeFile}/>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
