import { createContext, useState } from "react";

export const ColorContext = createContext()

export default function ColorProvider({ children }) {
    const [colors, setColors] = useState(new Map())

    return (
        <ColorContext.Provider value={{ colors, setColors }}>
            {children}
        </ColorContext.Provider>
    )
}