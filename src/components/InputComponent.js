import { useContext } from "react";
import CSVPeriodeInput from '../components/CSVPeriodeInput';
import GherkinPeriodeInput from '../components/GherkinPeriodeInput';
import { CSV_PARSER, GHERKIN_PARSER } from "../parsers/Parser";
import { InputTextContext } from '../state/InputTextProvider';

export default function InputComponent() {

    const { parser } = useContext(InputTextContext)

    function parserComponentFor(parser) {
        switch (parser) {
            case CSV_PARSER:
                return < CSVPeriodeInput />
            case GHERKIN_PARSER:
                return < GherkinPeriodeInput />
            default:
                return < CSVPeriodeInput />
        }
    }

    return parserComponentFor(parser);
}