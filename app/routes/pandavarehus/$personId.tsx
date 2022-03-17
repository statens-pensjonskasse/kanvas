import { HStack, Textarea, Tooltip, VStack } from "@chakra-ui/react"
import { useContext, useRef } from "react"
import { Outlet } from "remix"
import { PandavarehusContext } from "~/state/PandavarehusProvider"


export default function PersonPandavarehus() {
    const { parset } = useContext(PandavarehusContext)
    const input = useRef()
    return (
        <VStack spacing='3em'>
            <Outlet />
            <HStack hidden>
                <Textarea
                    ref={input}
                    readOnly
                    resize={'both'}
                    spellCheck="false"
                    placeholder={"Kjør pandavarehus-kanvas-connector.sh lokalt for å kunne hente data fra pandavarehus"}
                    value={parset}
                    minWidth={'2xl'}
                    minHeight={'20em'}
                    wrap='off'
                    overflow={'auto'}
                    fontFamily={'mono'}
                />
            </HStack>
            <Tooltip
                maxWidth={'container.xl'}
                label={`Henter data fra pandavarehus`}
            >
                ?
            </Tooltip>
        </VStack >
    )
}