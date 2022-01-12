import { useContext } from "react";
import CSVPeriodeInput from './input/CSVPeriodeInput';
import GherkinPeriodeInput from './input/GherkinPeriodeInput';
import { CSV_PARSER, GHERKIN_PARSER, PANDAVAREHUS } from "../parsers/Parser";
import { InputTextContext } from '../state/InputTextProvider';
import PandavarehusInput from './input/PandavarehusInput';

export default function InputComponent() {

    const { parser } = useContext(InputTextContext)

    function parserComponentFor(parser) {
        switch (parser) {
            case CSV_PARSER:
                return < CSVPeriodeInput />
            case GHERKIN_PARSER:
                return < GherkinPeriodeInput />
            case PANDAVAREHUS:
                return <PandavarehusInput/>
            default:
                return < CSVPeriodeInput />
        }
    }

    return parserComponentFor(parser);
}