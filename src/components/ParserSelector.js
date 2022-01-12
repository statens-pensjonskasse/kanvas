import { Container, Select } from "@chakra-ui/react"
import { useContext } from "react"
import { CSV_PARSER, GHERKIN_PARSER } from "../parsers/Parser"
import { InputTextContext } from "../state/InputTextProvider"

export default function ParserSelector() {
    const { parser, setParser, parseInputText } = useContext(InputTextContext)

    function handleParserChange(event) {
        parseInputText('')
        setParser(event.target.value)
    }

    return (
        <Container >
            <Select className="parser-selector" value={parser} onChange={handleParserChange}>
                <option value={CSV_PARSER}>CSV</option>
                <option value={GHERKIN_PARSER}>Cucumber</option>
            </Select>
        </Container>

    )
}