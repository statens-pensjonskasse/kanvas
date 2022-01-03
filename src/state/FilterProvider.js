import { createContext, useState } from "react";

export const FilterContext = createContext()

export default function FilterProvider({ children }) {
    const [filters, setFilters] = useState(new Map())

    return (
        <FilterContext.Provider value={{ filters, setFilters }}>
            {children}
        </FilterContext.Provider>
    )
}