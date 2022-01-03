import { createContext, useState } from "react";

export const TidslinjeContext = createContext()

export default function TidslinjerProvider({ children }) {
    const [tidslinjer, setTidslinjer] = useState([])

    return (
        <TidslinjeContext.Provider value={{ tidslinjer, setTidslinjer }}>
            {children}
        </TidslinjeContext.Provider>
    )
}