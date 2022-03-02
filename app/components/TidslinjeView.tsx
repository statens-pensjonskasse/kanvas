import { Button, Container, FormControl, FormLabel, HStack, Image, Switch, Text, VStack } from "@chakra-ui/react";
import html2canvas from "html2canvas";
import { useContext, useEffect, useRef, useState } from "react";
import Tidslinje from "../domain/Tidslinje";
import { ColorContext } from "../state/ColorProvider";
import { FilterContext } from "../state/FilterProvider";
import { PandavarehusContext } from "../state/PandavarehusProvider";
import { TidslinjeContext } from '../state/TidslinjerProvider';


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

  useEffect(() => {
    const visualiser = async () => {
      const { tegnTidslinjer } = await import('./TidslinjeTegner')
      tegnTidslinjer(
        tidslinjeRef.current,
        xAxisRef.current,
        wrapperRef.current,
        kompakteEgenskaper,
        visningsTidslinjer || [],
        filters,
        colors
      )
    }

    visualiser()

  }, [
    colors,
    tidslinjer,
    filters,
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
      <div ref={containerRef}>
        <svg ref={wrapperRef}>
          <g ref={tidslinjeRef} />
          <g ref={xAxisRef} />
        </svg>
      </div>
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