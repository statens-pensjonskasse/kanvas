import { createContext } from 'react';
import { CSV_PARSER } from '~/parsers/Parser';
import { useStickyState } from '~/util/useStickyState';

export const InputTextContext = createContext(null);

export default function InputTextProvider({ children }) {
    const [parser, setParser] = useStickyState(CSV_PARSER, 'parser')
    const [inputText, setInputText] = useStickyState("", 'inputText');

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