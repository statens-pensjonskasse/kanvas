import { Tooltip, VStack } from "@chakra-ui/react"
import { Outlet } from "remix"


export default function PersonPandavarehus() {
    return (
        <VStack spacing='3em'>
            <Outlet />
            <Tooltip
                maxWidth={'container.xl'}
                label={`Henter data fra pandavarehus`}
            >
                ?
            </Tooltip>
        </VStack >
    )
}