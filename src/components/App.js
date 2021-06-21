import React, { useState } from "react";
import TidslinjerView from "./TidslinjeView";
import GherkinPeriodeInput from "./GherkinPeriodeInput";
import CSVPeriodeInput from "./CSVPeriodeInput";
import "../css/App.css";

import { CSV_PARSER, GHERKIN_PARSER } from "../parsers/Parser"

function App() {
  const [tidslinjer, setTidslinjer] = useState([])
  const [colors, setColors] = useState(new Map())
  const [filters, setFilters] = useState(new Map())
  const [parser, setParser] = useState(CSV_PARSER)

  return (
    <React.Fragment>
      <h2>kanvas <span role="img" aria-label="paint brush">🖌️</span></h2>

      <TidslinjerView tidslinjer={tidslinjer} colors={colors} filters={filters} />

      <select className="parser-selector" value={parser} onChange={handleParserChange}>
        <option value={CSV_PARSER}>CSV</option>
        <option value={GHERKIN_PARSER}>Cucumber</option>
      </select>

      {parserComponentFor(parser, setTidslinjer, setColors, setFilters)}


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

  function handleParserChange(event) {
    setParser(event.target.value)
  }
}


function parserComponentFor(parser, setTidslinjer, setColors, setFilters) {
  switch (parser) {
    case CSV_PARSER:
      return < CSVPeriodeInput setTidslinjer={setTidslinjer} setColors={setColors} setFilters={setFilters} />
    case GHERKIN_PARSER:
      return < GherkinPeriodeInput setTidslinjer={setTidslinjer} setColors={setColors} setFilters={setFilters} />
    default:
      return < CSVPeriodeInput setTidslinjer={setTidslinjer} setColors={setColors} setFilters={setFilters} />
  }
}

export default App;
