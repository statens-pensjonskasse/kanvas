import {
    Button, Checkbox, CheckboxGroup, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent,
    PopoverHeader, PopoverTrigger, Stack
} from "@chakra-ui/react";
import { useContext } from "react";
import { PandavarehusContext } from "~/state/PandavarehusProvider";

export default function TidslinjeSelector() {
    const {
        tidslinjeIder,
        valgteTidslinjeIder,
        velgTidslinjeIder,
    } = useContext(PandavarehusContext)

    return (
        <Popover>
            <PopoverTrigger>
                <Button w={'md'} colorScheme={valgteTidslinjeIder.length ? 'orange' : null}>
                    Valgte tidslinjer ({valgteTidslinjeIder.length})
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader>Tidslinjer</PopoverHeader>
                <PopoverBody>
                    <CheckboxGroup colorScheme='green' value={valgteTidslinjeIder} onChange={velgTidslinjeIder}>
                        <Stack overflow={'clip'}>
                            {
                                [
                                    ...valgteTidslinjeIder,
                                    ...tidslinjeIder.filter(t => !valgteTidslinjeIder.includes(t))
                                ]
                                    .sort()
                                    .map(
                                        (tidslinjeId, i) => <Checkbox key={i} value={tidslinjeId}>{tidslinjeId}</Checkbox>
                                    )
                            }
                        </Stack>
                    </CheckboxGroup>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    )
}