import { createContext, useState } from "react";
import Tidslinje from "../domain/Tidslinje";

interface TidslinjeContextInterface {
    tidslinjer: Tidslinje[],
    setTidslinjer(nyeTidslinjer: Tidslinje[]): void
}

export const TidslinjeContext = createContext<TidslinjeContextInterface>(null)


export default function TidslinjerProvider({ children }) {
    const [tidslinjer, setTidslinjer] = useState<Tidslinje[]>([])


    return (
        <TidslinjeContext.Provider value={{ tidslinjer, setTidslinjer }}>
            {children}
        </TidslinjeContext.Provider>
    )
}