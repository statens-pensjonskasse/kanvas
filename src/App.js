import React, { useState } from "react";
import Tidslinjer from "./Tidslinjer";
import PeriodeInput from "./PeriodeInput";
import "./App.css";

function App() {
  const [perioder, setPerioder] = useState([])

  return (
    <React.Fragment>
      <h2>kanvas <span role="img" aria-label="paint brush">🖌️</span></h2>
      <Tidslinjer data={perioder} />
      <PeriodeInput setPerioder={setPerioder} />
      <footer>
        <a href="http://git.spk.no/projects/INC/repos/kanvas/browse" target="_blank" rel="noopener noreferrer">kildekode</a>
      </footer>
    </React.Fragment>
  );
}

export default App;
