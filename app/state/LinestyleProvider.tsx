import { createContext, useState } from "react";
import {LinestyleKey} from "~/parsers/CSVLinestyleparser";

export const LinestyleContext = createContext(null)

export default function LinestyleProvider({ children }) {
    const [lineStyles, setLinestyle] = useState<Map<LinestyleKey, string>>(new Map())

    return (
        <LinestyleContext.Provider value={{ lineStyles, setLinestyle }}>
            {children}
        </LinestyleContext.Provider>
    )
}
