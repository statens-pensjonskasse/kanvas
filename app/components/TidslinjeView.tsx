import { Button, Container, FormControl, FormLabel, HStack, Image, Switch, Text, VStack } from "@chakra-ui/react";
import html2canvas from "html2canvas";
import { useContext, useEffect, useRef, useState } from "react";
import Tidslinje from "../domain/Tidslinje";
import { ColorContext } from "../state/ColorProvider";
import { FilterContext } from "../state/FilterProvider";
import { PandavarehusContext } from "../state/PandavarehusProvider";
import { TidslinjeContext } from '../state/TidslinjerProvider';
import useResizeObserver from "../util/useResizeObserver";


export default function TidslinjerView() {
  const { tidslinjer } = useContext(TidslinjeContext);
  const { filters } = useContext(FilterContext)
  const { colors } = useContext(ColorContext)
  const { valgteTidslinjeIder, sisteSimulerteTilstand } = useContext(PandavarehusContext)
  const [screenshot, setScreenshot] = useState("")
  const [kompakteEgenskaper, setKompakteEgenskaper] = useState(false)

  const visningsTidslinjer: Tidslinje[] = valgteTidslinjeIder.length ? tidslinjer
    .filter(t => valgteTidslinjeIder.includes(t.label))
    .sort((a, b) => a.posisjon - b.posisjon)
    .map((t, i) => t.medPosisjon(i))
    : tidslinjer

  const tidslinjeRef = useRef<SVGSVGElement>();
  const xAxisRef = useRef<SVGSVGElement>();
  const wrapperRef = useRef<SVGSVGElement>();
  const containerRef = useRef<HTMLDivElement>();
  const dimensions: DOMRectReadOnly = useResizeObserver(containerRef);

  useEffect(() => {
    const tegnTidslinjer = async () => {
      const { tegnTidslinjer } = await import('./TidslinjeTegner')
      tegnTidslinjer(
        tidslinjeRef.current,
        xAxisRef.current,
        containerRef.current,
        kompakteEgenskaper,
        visningsTidslinjer,
        filters,
        colors
      )
    }

    tegnTidslinjer()

  }, [
    colors,
    tidslinjer,
    filters,
    dimensions,
    kompakteEgenskaper,
    valgteTidslinjeIder
  ]);

  const generateScreenshot = async () => {
    const canvas = await html2canvas(containerRef.current)
    const base64image = canvas.toDataURL("image/png")
    setScreenshot(base64image)
  }


  return (
    <Container
      rounded='md'
      shadow={'dark-lg'}
      maxWidth={'95%'}
      overflow={'auto'}
      padding={'5'}
    >
      <Container ref={containerRef}>
        <svg ref={wrapperRef} height={dimensions?.height} width={dimensions?.width}>
          <g ref={tidslinjeRef} />
          <g ref={xAxisRef} >
            <g className="x-axis" />
          </g>
        </svg>
      </Container>
      <HStack>
        <VStack>
          <HStack>
            <Button colorScheme={'blue'} onClick={generateScreenshot}>Generer skjermbilde</Button>
            {screenshot && <Button onClick={() => setScreenshot(null)}>X</Button>}
          </HStack>
          {screenshot && <Text>(Høyreklikk og kopier)</Text>}
          {screenshot && <Image height={'10em'} src={screenshot} />}
        </VStack>
        <FormControl display='flex' alignItems='center'>
          <FormLabel htmlFor='kompakte-egenskaper' mb='0'>
            Kompakte egenskaper?
          </FormLabel>
          <Switch
            id='kompakte-egenskaper'
            isChecked={kompakteEgenskaper}
            onChange={e => setKompakteEgenskaper(e.target.checked)}
          />
        </FormControl>
      </HStack>
    </Container >
  );
}