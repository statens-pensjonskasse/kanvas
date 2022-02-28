import { useContext } from "react";
import { CSV_PARSER, GHERKIN_PARSER, PANDAVAREHUS_POLISER, PANDAVAREHUS_TIDSLINJEHENDELSER } from "../parsers/Parser";
import { InputTextContext } from '../state/InputTextProvider';
import CSVPeriodeInput from './input/CSVPeriodeInput';
import GherkinPeriodeInput from './input/GherkinPeriodeInput';
import PandavarehusPoliserInput from './input/PandavarehusPoliserInput';
import PandavarehusTidslinjehendelserInput from './input/PandavarehusTidslinjehendelserInput';

export default function InputComponent() {

    const { parser } = useContext(InputTextContext)

    function parserComponentFor(parser) {
        switch (parser) {
            case CSV_PARSER:
                return < CSVPeriodeInput />
            case GHERKIN_PARSER:
                return < GherkinPeriodeInput />
            case PANDAVAREHUS_POLISER:
                return <PandavarehusPoliserInput />
            case PANDAVAREHUS_TIDSLINJEHENDELSER:
                return <PandavarehusTidslinjehendelserInput />
            default:
                console.error("Kjenner ikke igjen parser", parser)
                return <CSVPeriodeInput />
        }
    }

    return parserComponentFor(parser);
}