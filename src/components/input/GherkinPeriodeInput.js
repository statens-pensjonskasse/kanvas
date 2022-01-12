import { HStack, Textarea, Tooltip, VStack } from "@chakra-ui/react";
import React, { useContext, useEffect } from "react";
import { hardkodet } from '../../hardkodinger/hardkodetGherkin';
import Colorparser from "../../parsers/CSVColorparser";
import Filterparser from "../../parsers/CSVFilterparser";
import GherkinTidslinjeparser from "../../parsers/GherkinTidslinjeparser";
import { ColorContext } from "../../state/ColorProvider";
import { FilterContext } from "../../state/FilterProvider";
import { InputTextContext } from "../../state/InputTextProvider";
import { TidslinjeContext } from "../../state/TidslinjerProvider";


export default function PeriodeInput() {
    const { setTidslinjer } = useContext(TidslinjeContext);
    const { setFilters } = useContext(FilterContext);
    const { setColors } = useContext(ColorContext)
    const { inputText, parseInputText } = useContext(InputTextContext)
    const input = React.createRef();

    const tidslinjeparser = new GherkinTidslinjeparser();

    const colorparser = new Colorparser({
        delimiter: ";"
    });

    const filterparser = new Filterparser({
        delimiter: ";"
    });


    useEffect(() => {
        parseCurrent()
    }, [])

    function parseCurrent() {
        parseContent(input.current.value)
    }

    function parseContent(rawString) {
        const content = rawString
            .split(/\r?\n/)
            .map(rad => rad.trim());

        setFilters(
            filterparser.parse(content)
        )

        setColors(
            colorparser.parse(content)
        )

        setTidslinjer(
            tidslinjeparser.parse(content)
        )

        parseInputText(rawString)
    }

    function handleChange(event) {
        event.preventDefault();
        parseCurrent();
    }

    return (
        <VStack>
            <HStack size={'xl'}>
                <Textarea
                    ref={input}
                    variant={'filled'}
                    resize={'both'}
                    autoFocus
                    type="text"
                    spellCheck="false"
                    onChange={handleChange}
                    placeholder="Gherkin"
                    defaultValue={inputText || hardkodet.join("\n")}
                    width={'80vw'}
                    height={'2xl'}
                    minWidth={'2xl'}
                    minHeight={'lg'}
                    wrap='off'
                    overflow={'auto'}
                    fontFamily={'mono'}
                />
            </HStack>
            <Tooltip
                maxWidth={'container.xl'}
                label={"Gherkin"}
            >
                ?
            </Tooltip>
        </VStack>
    );
}