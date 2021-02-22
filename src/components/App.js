import React, { useState } from "react";
import Tidslinjer from "./Tidslinjer";
import PeriodeInput from "./PeriodeInput";
import "../css/App.css";

function App() {
  const [tidslinjer, setTidslinjer] = useState([])
  const [colors, setColors] = useState(new Map())

  return (
    <React.Fragment>
      <h2>kanvas <span role="img" aria-label="paint brush">🖌️</span></h2>

      <Tidslinjer tidslinjer={tidslinjer} colors={colors} />

      <PeriodeInput setTidslinjer={setTidslinjer} setColors={setColors} />

      <footer>
        <a href="mailto:jarle.mathiesen@spk.no?subject=kanvas" target="_blank" rel="noopener noreferrer">tilbakemelding/forslag</a>
        <span> ✉️ </span>
        <br></br>
        <br></br>
        <a href="http://git.spk.no/projects/INC/repos/kanvas/browse" target="_blank" rel="noopener noreferrer">kildekode</a>
        <span> 🖥️</span>
      </footer>
    </React.Fragment>
  );
}

export default App;
