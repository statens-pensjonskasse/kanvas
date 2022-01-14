import { Badge, Button, Container, HStack, Input, Radio, RadioGroup, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Stack, Text, Tooltip, VStack } from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import { InputTextContext } from "../../state/InputTextProvider";
import { PandavarehusContext } from "../../state/PandavarehusProvider";

export default function Simuleringsslider() {
    const {
        tilstand,
        maxTilstand,
        setTilstand,
        tidslinjehendelse,
        table,
        setTable,
        person,
        setPerson
    } = useContext(PandavarehusContext)
    const [showTooltip, setShowTooltip] = useState(false)
    const { parser } = useContext(InputTextContext)

    const {
        Aksjonsdato,
        Egenskap,
        Forrige,
        Neste,
        Hendelsesnummer,
        Hendelsestype,
        PersonId,
        PoliseId,
        TidslinjeId,
        Tidslinjehendelsestype,
        Typeindikator
    } = tidslinjehendelse || {};

    if (!parser.startsWith("PANDAVAREHUS_")) {
        return null
    }

    return (
        <VStack>
            <RadioGroup onChange={setTable} value={table}>
                <Stack direction={'row'}>
                    <Radio value='forrige'>Forrige</Radio>
                    <Radio value='neste'>Neste</Radio>
                </Stack>
            </RadioGroup>
            <HStack>
                <Text>PersonId:</Text>
                <Container shadow='md' rounded='lg'>
                    <Input
                        value={person}
                        placeholder="PersonId"
                        onChange={event => {
                            event.preventDefault()
                            setPerson(event.target.value)
                        }}
                        textAlign={'center'}
                        variant={'flushed'}
                        autoFocus
                        blur
                        opacity={"0"}
                        _hover={{
                            opacity: "100"
                        }}
                        _focus={{
                            opacity: "100"
                        }}
                    />

                </Container>
            </HStack>
            <HStack>
                <Button
                    onClick={e => setTilstand(Math.max(0, tilstand - 1))}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                > - </Button>
                <Slider
                    min={0}
                    max={maxTilstand}
                    step={1}
                    defaultValue={tilstand}
                    value={tilstand}
                    onChange={setTilstand}
                    minWidth={'container.md'}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <SliderTrack>
                        <SliderFilledTrack />
                    </SliderTrack>
                    <Tooltip
                        hasArrow
                        color='white'
                        placement='top'
                        isOpen={showTooltip}
                        label={`Tilstand ${tilstand}`}
                    >
                        <SliderThumb />
                    </Tooltip>
                </Slider>
                <Button
                    onClick={e => setTilstand(Math.min(maxTilstand, tilstand + 1))}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                > + </Button>
            </HStack>
            {
                tidslinjehendelse && (
                    <VStack
                        rounded='xl'
                        shadow={'lg'}
                        justifyContent={'center'}
                        padding={'4'}
                        maxW={'container.xl'}
                    >
                        <HStack>
                            <Badge fontSize={'lg'}> {Aksjonsdato.toLocaleDateString('nb-NO')} </Badge>
                            {Hendelsestype !== 'UKJENT' && <Badge colorScheme={'blue'} fontSize={'lg'}>{Hendelsestype}</Badge>}
                        </HStack>
                        <HStack>
                            <Badge>{Tidslinjehendelsestype}</Badge>
                            <Text fontSize="lg" fontWeight={'bold'} textColor={'red'}>
                                {Typeindikator}
                            </Text>
                        </HStack>
                        <VStack >
                            <Text fontWeight={'bold'}>
                                {Egenskap}
                            </Text>
                            <Text fontFamily={'mono'}>
                                Fra: {Forrige?.replaceAll("\\n", "") || "<tom>"}
                            </Text>
                            <Text fontFamily={'mono'}>
                                Til: {Neste?.replaceAll("\\n", "") || "<tom>"}
                            </Text>
                        </VStack>

                    </VStack>
                )
            }

        </VStack>
    )
}