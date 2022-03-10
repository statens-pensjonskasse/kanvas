import { useContext } from "react";
import { CSV_PARSER, GHERKIN_PARSER } from "../parsers/Parser";
import { InputTextContext } from '../state/InputTextProvider';
import CSVPeriodeInput from './input/CSVPeriodeInput';
import GherkinPeriodeInput from './input/GherkinPeriodeInput';

export default function InputComponent() {

    const { parser } = useContext(InputTextContext)

    function parserComponentFor(parser) {
        switch (parser) {
            case CSV_PARSER:
                return < CSVPeriodeInput />
            case GHERKIN_PARSER:
                return < GherkinPeriodeInput />
            default:
                console.error("Kjenner ikke igjen parser", parser)
                return <CSVPeriodeInput />
        }
    }

    return parserComponentFor(parser);
}