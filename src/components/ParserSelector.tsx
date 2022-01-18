import { Container, Select } from "@chakra-ui/react"
import { useContext } from "react"
import { CSV_PARSER, GHERKIN_PARSER, PANDAVAREHUS_POLISER, PANDAVAREHUS_TIDSLINJEHENDELSER } from "../parsers/Parser"
import { InputTextContext } from "../state/InputTextProvider"
import { PandavarehusContext } from "../state/PandavarehusProvider"

export default function ParserSelector() {
    const { parser, setParser, parseInputText } = useContext(InputTextContext)
    const { nullstill } = useContext(PandavarehusContext)

    function handleParserChange(event) {
        nullstill()
        parseInputText("")
        setParser(event.target.value)
    }

    return (
        <Container >
            <Select className="parser-selector" value={parser} onChange={handleParserChange}>
                <option value={CSV_PARSER}>CSV</option>
                <option value={GHERKIN_PARSER}>Cucumber</option>
                <option value={PANDAVAREHUS_POLISER}>Pandavarehus poliser</option>
                <option value={PANDAVAREHUS_TIDSLINJEHENDELSER}>Pandavarehus tidslinjehendelser</option>
            </Select>
        </Container>

    )
}