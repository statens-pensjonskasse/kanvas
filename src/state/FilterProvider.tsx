import { createContext, useState } from "react";

export const FilterContext = createContext(null)

export default function FilterProvider({ children }) {
    const [filters, setFilters] = useState<Map<string, string>>(new Map())

    return (
        <FilterContext.Provider value={{ filters, setFilters }}>
            {children}
        </FilterContext.Provider>
    )
}