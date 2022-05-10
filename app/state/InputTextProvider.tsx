import { createContext, useState } from 'react';
import { CSV_PARSER } from '~/parsers/Parser';

export const InputTextContext = createContext(null);

export default function InputTextProvider({ children }) {
    const [parser, setParser] = useState(CSV_PARSER)
    const [inputText, setInputText] = useState("");

    function parseInputText(text) {
        setInputText(text)
    }

    return (
        <InputTextContext.Provider value={{
            inputText,
            parseInputText,
            parser,
            setParser
        }}>
            {children}
        </InputTextContext.Provider>
    )
}