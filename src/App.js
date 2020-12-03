import React, { useEffect, useState } from "react";
import Tidslinjer from "./Tidslinjer";
import PeriodeInput from "./PeriodeInput";
import "./App.css";

function App() {
  const [perioder, setPerioder] = useState([])
  
  return (
    <React.Fragment>
      <Tidslinjer data={perioder} />
      <PeriodeInput setPerioder={setPerioder} />
    </React.Fragment>
  );
}

export default App;
