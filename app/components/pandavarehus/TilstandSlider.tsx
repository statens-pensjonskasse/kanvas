import {
    Button, HStack, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Tooltip
} from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import { PandavarehusContext } from "~/state/PandavarehusProvider";

export default function TilstandSlider() {
    const {
        tilstand,
        maxTilstand,
        oppdaterTilstand,
        diff
    } = useContext(PandavarehusContext)
    const [showTooltip, setShowTooltip] = useState(false)

    return (
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
    )
}