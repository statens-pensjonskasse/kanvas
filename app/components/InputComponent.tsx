import { Tab, TabList, TabPanel, TabPanels, Tabs, Textarea } from "@chakra-ui/react";
import { useContext } from "react";
import { TidslinjeContext } from "~/state/TidslinjerProvider";
import { CSV_PARSER, GHERKIN_PARSER } from "../parsers/Parser";
import { InputTextContext } from '../state/InputTextProvider';
import CSVPeriodeInput from './input/CSVPeriodeInput';
import GherkinPeriodeInput from './input/GherkinPeriodeInput';

export default function InputComponent() {

    const { parser } = useContext(InputTextContext)
    const { tidslinjer } = useContext(TidslinjeContext)

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

    return (
        <>
            <Tabs variant={'enclosed'} colorScheme={'blue'} minWidth={'60em'}>
                <TabList>
                    <Tab>Input</Tab>
                    <Tab>Kjørende dokumentasjon</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        {parserComponentFor(parser)}
                    </TabPanel>
                    <TabPanel>
                        <Textarea
                            readOnly
                            defaultValue={tidslinjer.map(t => t.somCucumber()).flatMap(r => r.join("\n")).join("\n\n\n")}
                            resize={'both'}
                            wrap='off'
                            fontFamily={'mono'}
                            minH={'50em'}
                        />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </>
    )
}