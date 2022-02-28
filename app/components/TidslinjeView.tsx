import { Button, Container, FormControl, FormLabel, HStack, Image, Switch, Text, useToast, VStack } from "@chakra-ui/react";
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
  const toast = useToast()
  const [kompakteEgenskaper, setKompakteEgenskaper] = useState(false)

  const visningsTidslinjer: Tidslinje[] = valgteTidslinjeIder.length ? tidslinjer
    .filter(t => valgteTidslinjeIder.includes(t.label))
    .sort((a, b) => a.posisjon - b.posisjon)
    .map((t, i) => t.medPosisjon(i))
    : tidslinjer

  const svgRef = useRef<SVGSVGElement>();
  const xAxisRef = useRef<SVGSVGElement>();
  const wrapperRef = useRef<HTMLDivElement>();
  const dimensions: DOMRectReadOnly = useResizeObserver(wrapperRef);

  useEffect(() => {
    const tegnTidslinjer = async () => {
      const { tegnTidslinjer } = await import('./TidslinjeTegner')
      tegnTidslinjer(
        svgRef,
        xAxisRef,
        wrapperRef,
        dimensions,
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

  const saveScreenshot = async () => {
    const canvas = await html2canvas(wrapperRef.current)
    canvas.toBlob(
      blob => {
        navigator.clipboard
          .write([
            new window.ClipboardItem(
              Object.defineProperty({}, blob.type, {
                value: blob,
                enumerable: true
              })
            )
          ])

        toast({
          description: "Kopierte skjermbilde til utklippstavla",
        })
      }
    )
  }

  const generateScreenshot = async () => {
    const canvas = await html2canvas(wrapperRef.current)
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
      <Container ref={wrapperRef} marginBottom={'10'}>
        <svg ref={svgRef} width={'100%'} />
        <svg ref={xAxisRef} width={'103%'} height={'2em'} >
          <g className="x-axis" />
        </svg>
      </Container>
      <HStack>
        {
          false && navigator.clipboard ? (
            <Button colorScheme={'blue'} onClick={saveScreenshot}>Kopier skjermbilde</Button>
          ) : (
            <VStack>
              <HStack>
                <Button colorScheme={'blue'} onClick={generateScreenshot}>Generer skjermbilde</Button>
                {screenshot && <Button onClick={() => setScreenshot(null)}>X</Button>}
              </HStack>
              {screenshot && <Text>(Høyreklikk og kopier)</Text>}
              {screenshot && <Image height={'10em'} src={screenshot} />}
            </VStack>
          )
        }
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
    </Container>
  );
}