import { createContext, useState } from "react";

export const ColorContext = createContext(null)

export default function ColorProvider({ children }) {
    const [colors, setColors] = useState<Map<string, string>>(new Map())

    return (
        <ColorContext.Provider value={{ colors, setColors }}>
            {children}
        </ColorContext.Provider>
    )
}