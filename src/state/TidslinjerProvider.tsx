import { createContext, useState } from "react";
import Tidslinje from "../domain/Tidslinje";

export const TidslinjeContext = createContext(null)

export default function TidslinjerProvider({ children }) {
    const [tidslinjer, setTidslinjer] = useState<Tidslinje[]>([])

    return (
        <TidslinjeContext.Provider value={{ tidslinjer, setTidslinjer }}>
            {children}
        </TidslinjeContext.Provider>
    )
}