import { Radio, RadioGroup, Stack, Tooltip } from "@chakra-ui/react";
import { useContext } from "react";
import { CSV_PARSER, GHERKIN_PARSER } from "~/parsers/Parser";
import { InputTextContext } from '~/state/InputTextProvider';

export default function ParserSelector() {
    const context = useContext(InputTextContext);

    if (!context) {
        throw new Error('ParserSelector must be used within an InputTextProvider');
    }

    const { parser, setParser, parseInputText } = context;

    function handleParserChange(value: string) {
        parseInputText("");
        setParser(value);
    }

    return (
        <RadioGroup onChange={handleParserChange} value={parser}>
            <Tooltip label={"Type input"}>
                <Stack direction={'row'}>
                    <Radio value={CSV_PARSER}>CSV</Radio>
                    <Radio value={GHERKIN_PARSER}>Cucumber</Radio>
                </Stack>
            </Tooltip>
        </RadioGroup>
    );
}