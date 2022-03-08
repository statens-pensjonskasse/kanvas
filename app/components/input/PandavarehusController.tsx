import { ArrowForwardIcon } from "@chakra-ui/icons";
import {
    Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Badge, Button, Checkbox, CheckboxGroup, Container, Grid, GridItem, Heading, HStack, Input, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent,
    PopoverHeader, PopoverTrigger, Radio, RadioGroup, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Stack, Tag, Text, Tooltip, VStack
} from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import Tidslinjehendelse from "~/domain/Tidslinjehendelse";
import { Tidslinjehendelsediff } from "~/domain/Tidslinjehendelsediff";
import { InputTextContext } from "../../state/InputTextProvider";
import { PandavarehusContext } from "../../state/PandavarehusProvider";

export default function PandavarehusController() {
    const {
        tilstand,
        maxTilstand,
        kategorisertHendelse,
        table,
        setTable,
        person,
        setPerson,
        tidslinjeIder,
        valgteTidslinjeIder,
        oppdaterTilstand,
        velgTidslinjeIder,
        toggleTidslinjeId,
        kategoriseringer,
        diff,
        poliseId,
        velgPoliseId,
        poliseIder
    } = useContext(PandavarehusContext)
    const [showTooltip, setShowTooltip] = useState(false)
    const { parser } = useContext(InputTextContext)

    const {
        aksjonsdato,
        kategorisering,
        hendelser
    } = kategorisertHendelse || {};

    if (!parser.startsWith("PANDAVAREHUS_")) {
        return null
    }

    const diffForHendelse = (hendelse: Tidslinjehendelse): Tidslinjehendelsediff | undefined => {
        return diff.diffForHendelse(hendelse)
    }

    const KategorisertHendelse = ({ tidslinjehendelse }) => {
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
        } = (tidslinjehendelse) || {};
        return (
            <AccordionItem key={`${Hendelsesnummer} ${Egenskap}`} >
                <Heading background={valgteTidslinjeIder.includes(TidslinjeId) ? 'gray.200' : 'none'}>
                    <AccordionButton>
                        <HStack flex='1' textAlign='left'>
                            {
                                diffForHendelse(tidslinjehendelse) && (
                                    <Tooltip label={diffForHendelse(tidslinjehendelse).beskrivelse}>
                                        <Tag colorScheme={'blue'}>{diffForHendelse(tidslinjehendelse).diffType}</Tag>
                                    </Tooltip>
                                )
                            }
                            <Tag colorScheme={'green'}>{Egenskap}</Tag>
                            <Text>{Forrige?.substring(0, 50) || "(tom)"}</Text>
                            <ArrowForwardIcon />
                            <Text>{Neste?.substring(0, 50) || "(tom)"}</Text>
                        </HStack>
                        <AccordionIcon />
                    </AccordionButton>
                </Heading>
                <AccordionPanel
                    overflow={'auto'}
                    padding={'5'}
                    margin={'5'}
                    shadow={'md'}
                    rounded={'lg'}
                >
                    <HStack>
                        <Badge
                            fontSize={'lg'}
                            colorScheme={(() => {
                                switch (Tidslinjehendelsestype) {
                                    case "NY":
                                        return "green"
                                    case "AVSLUTT":
                                        return "red"
                                    default:
                                        return "blue";
                                }
                            })()}
                        >
                            {Tidslinjehendelsestype}
                        </Badge>
                        <Text
                            fontSize="lg"
                            fontWeight={'bold'}
                            textColor={'red'}
                            onClick={() => toggleTidslinjeId(TidslinjeId)}
                        >
                            {Typeindikator}
                        </Text>
                    </HStack>
                    <VStack alignItems={'left'} >
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
                </AccordionPanel>
            </AccordionItem>
        )
    }


    const HendelserComponent = () => {
        return (
            <Grid
                templateRows='repeat(1, 1fr)'
                templateColumns='repeat(3, 1fr)'
                gap={4}
                width={'90vw'}
                maxH='50vh'
            >
                <GridItem colSpan={2} overflow='auto'>
                    <VStack shadow={'md'} minH={'100%'} rounded={'xl'} padding={'3'}>
                        <HStack>
                            <Heading size={'sm'}>#{hendelser[0].Hendelsesnummer}</Heading>
                            <Badge fontSize={'lg'}>{aksjonsdato.aksjonsdato} </Badge>
                            <Heading size={'md'}>{kategorisering}</Heading>
                        </HStack>
                        <VStack minH={'5em'}>
                            {
                                [...new Set(hendelser.map(hendelse => hendelse.Typeindikator))] // finn unike typeindikatorer
                                    .map(typeindikator => <Badge>{typeindikator}</Badge>)
                            }
                        </VStack>
                        <Accordion minWidth={'100%'} maxW={'100%'} overflow={'clip'} minH={'20em'} allowToggle allowMultiple>
                            {
                                hendelser
                                    .map(
                                        (tidslinjehendelse, i) => <KategorisertHendelse key={i} tidslinjehendelse={tidslinjehendelse} />
                                    )
                            }
                        </Accordion>
                    </VStack>
                </GridItem>
                <GridItem colSpan={1} overflow='auto'>
                    <Container shadow='md' rounded='xl' padding={3}>
                        <VStack alignItems={'left'}>
                            {
                                kategoriseringer()
                                    .map(
                                        (kategoriserbarHendelse, i) => (
                                            <HStack
                                                spacing={2}
                                                onClick={() => oppdaterTilstand(i)}
                                                shadow={tilstand === i ? 'outline' : 'none'}
                                                key={i}
                                            >
                                                <Tag>
                                                    {kategoriserbarHendelse.aksjonsdato.aksjonsdato}
                                                </Tag>
                                                <Text >
                                                    {`${kategoriserbarHendelse.kategorisering}`}
                                                </Text>
                                                {
                                                    kategoriserbarHendelse.hendelser.some(diffForHendelse) && (
                                                        <Tooltip
                                                            label={
                                                                kategoriserbarHendelse.hendelser
                                                                    .filter(diffForHendelse)
                                                                    .map((h, i) => <Text key={i}>{h.Egenskap}</Text>)
                                                            }
                                                        >
                                                            <Tag colorScheme={'blue'}>Endret</Tag>
                                                        </Tooltip>
                                                    )
                                                }

                                            </HStack>
                                        )
                                    )
                            }
                        </VStack>
                    </Container>
                </GridItem>
            </Grid>
        )

    }

    return (
        <VStack>
            <HStack width={'container.sm'}>
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
            </HStack>
            <RadioGroup onChange={setTable} value={table}>
                <Stack direction={'row'}>
                    <Radio value='forrige'>Forrige</Radio>
                    <Radio value='neste'>Neste</Radio>
                </Stack>
            </RadioGroup>
            {kategorisertHendelse && (
                <>
                    <HendelserComponent />
                    <HStack>
                        <HStack>
                            <RadioGroup value={poliseId} onChange={e => velgPoliseId(Number.parseInt(e))}>
                                <HStack>
                                    {
                                        poliseIder.map(
                                            id => <Radio key={id} value={id}>
                                                <Text>{`Polise:${id}`}</Text>
                                            </Radio>
                                        )
                                    }
                                </HStack>
                            </RadioGroup>
                        </HStack>
                        <Button
                            onClick={e => oppdaterTilstand(tilstand - 1)}
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                        > - </Button>
                        <Slider
                            min={0}
                            max={maxTilstand}
                            step={1}
                            defaultValue={tilstand}
                            value={tilstand}
                            onChange={oppdaterTilstand}
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
                            onClick={e => oppdaterTilstand(tilstand + 1)}
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                        > + </Button>
                    </HStack>
                </>
            )}

        </VStack>
    )
}