import { HStack, Textarea, Tooltip, VStack } from "@chakra-ui/react";
import React, { useContext, useEffect } from "react";
import { hardkodet } from "~/hardkodinger/hardkodetCSV";
import Colorparser from "../../parsers/CSVColorparser";
import Linestyleparser from "../../parsers/CSVLinestyleparser";
import CSVTidslinjeparser from "../../parsers/CSVTidslinjeparser";
import { ColorContext } from "~/state/ColorProvider";
import { LinestyleContext } from "~/state/LinestyleProvider";
import { InputTextContext } from "~/state/InputTextProvider";
import { TidslinjeContext } from "~/state/TidslinjerProvider";

export default function PeriodeInput() {
    const input = React.createRef<HTMLTextAreaElement>();
    const { inputText, parseInputText } = useContext(InputTextContext)
    const { setTidslinjer } = useContext(TidslinjeContext)
    const { setColors } = useContext(ColorContext)
    const { setLinestyle } = useContext(LinestyleContext)

    const delimiter = ";"
    const fraOgMedIndex = 1
    const tilOgMedIndex = 2
    const identifikatorIndex = 0

    const tidslinjeparser = new CSVTidslinjeparser({
        delimiter: delimiter,
        fraOgMedIndex: fraOgMedIndex,
        tilOgMedIndex: tilOgMedIndex,
        identifikatorIndex: identifikatorIndex
    });

    const colorparser = new Colorparser({
        delimiter: delimiter
    });

    const linestyleparser = new Linestyleparser({
        delimiter: delimiter,
    });

    useEffect(() => {
        if (inputText) {
            input.current.value = inputText
        }
        parseCurrent()
        input.current.focus()
    }, [])

    function parseCurrent() {
        parseContent(input.current.value)
    }

    function parseContent(rawString) {
        const content = rawString
            .split(/\r?\n/)
            .filter(rad => !rad.startsWith("#"))
            .map(rad => rad.trim());

        setColors(
            colorparser.parse(content)
        )

        setLinestyle(
            linestyleparser.parse(content)
        )

        setTidslinjer(
            tidslinjeparser.parse(content)
        )
    }

    function handleChange(event) {
        event.preventDefault();
        parseInputText(event.target.value)
        parseCurrent();
    }

    const csvHintArray = new Array(Math.max(fraOgMedIndex, tilOgMedIndex, identifikatorIndex)).fill("___")
    csvHintArray[identifikatorIndex] = "[Identifikator]"
    csvHintArray[fraOgMedIndex] = "[Fra og med]"
    csvHintArray[tilOgMedIndex] = "[Til og med]"
    csvHintArray.push(`[egenskaper separert med "${delimiter}"]`)

    const periodeHint = "CSV-format for tidsperioder: " + csvHintArray.join(delimiter)
    const colorHint = "CSV-format for farger: [Identifikator];color;[farge]"
    const linestyleHint1 = "CSV-format for linjestil (hele linja): [Identifikator];linestyle;[stil]"
    const linestyleHint2 = "CSV-format for linjestil (en periode): [Identifikator];"
        + csvHintArray[fraOgMedIndex] + ";" + csvHintArray[tilOgMedIndex] + ";linestyle;" + "[stil]"

    const longestLine = Math.max(...inputText?.split("\n").map(t => t.length), 50)

    return (
        <VStack>
            <HStack>
                <Textarea
                    ref={input}
                    variant={'filled'}
                    resize={'both'}
                    autoFocus
                    spellCheck="false"
                    onChange={handleChange}
                    placeholder={`${periodeHint}`}
                    defaultValue={inputText || hardkodet.join("\n")}
                    minWidth={`${Math.min(100, longestLine)}em`}
                    minHeight={'20em'}
                    wrap='off'
                    overflow={'auto'}
                    fontFamily={'mono'}
                />
            </HStack>
            <Tooltip
                maxWidth={'container.xl'}
                label={[periodeHint, colorHint, linestyleHint1, linestyleHint2].map(t => <div>{t}</div>)}
            >
                ?
            </Tooltip>
        </VStack >

    );
}