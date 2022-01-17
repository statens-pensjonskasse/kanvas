import { ArrowForwardIcon } from "@chakra-ui/icons";
import {
    Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Badge, Button, Checkbox, CheckboxGroup, Container, Heading, HStack, Input, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent,
    PopoverHeader, PopoverTrigger, Radio, RadioGroup, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Stack, Tag, Text, Tooltip, VStack, Wrap
} from "@chakra-ui/react";
import React, { useContext, useState } from "react";
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
        setValgteTidslinjeIder,
        oppdaterTilstand
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
            <AccordionItem key={`${Hendelsesnummer} ${Egenskap}`}>
                <h2>
                    <AccordionButton>
                        <HStack flex='1' textAlign='left'>
                            <Tag colorScheme={'green'}>{Egenskap}</Tag>
                            <Text>{Forrige?.substring(0, 50) || "(tom)"}</Text>
                            <ArrowForwardIcon />
                            <Text>{Neste?.substring(0, 50) || "(tom)"}</Text>
                        </HStack>
                        <AccordionIcon />
                    </AccordionButton>
                </h2>
                <AccordionPanel maxW={'3xl'} overflow={'auto'} padding={'5'} margin={'5'} shadow={'md'} rounded={'lg'}>
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
                            {Tidslinjehendelsestype}</Badge>
                        <Text fontSize="lg" fontWeight={'bold'} textColor={'red'}>
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
            <Wrap shadow={'md'} rounded={'xl'} padding={'3'}>
                <VStack>
                    <HStack>
                        <Badge fontSize={'lg'}> {aksjonsdato.toLocaleDateString('nb-NO')} </Badge>
                        <Heading size={'md'}>{kategorisering}</Heading>
                    </HStack>
                    <Accordion minW={'70em'} minH={'20em'} allowToggle allowMultiple>
                        {
                            hendelser
                                .map(
                                    (tidslinjehendelse, i) => <KategorisertHendelse key={i} tidslinjehendelse={tidslinjehendelse} />
                                )
                        }
                    </Accordion>
                </VStack>

            </Wrap>
        )

    }

    return (
        <VStack>
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
                <Popover>
                    <PopoverTrigger>
                        <Button w={'md'}>
                            Valgte tidslinjer ({valgteTidslinjeIder.length})
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverHeader>Tidslinjer</PopoverHeader>
                        <PopoverBody>
                            <CheckboxGroup colorScheme='green' value={valgteTidslinjeIder} onChange={setValgteTidslinjeIder}>
                                <Stack overflow={'clip'}>
                                    {
                                        tidslinjeIder
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
            <HStack>
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
            {kategorisertHendelse && <HendelserComponent />}

        </VStack>
    )
}