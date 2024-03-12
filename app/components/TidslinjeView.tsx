import { Box, Checkbox, FormControl, FormLabel, HStack, Tooltip, VStack } from "@chakra-ui/react";
import { useContext, useEffect, useRef, useState } from "react";
import Tidslinje from "../domain/Tidslinje";
import { ColorContext } from "~/state/ColorProvider";
import { LinestyleContext } from "~/state/LinestyleProvider";
import { FilterContext } from "~/state/FilterProvider";
import { TidslinjeContext } from '~/state/TidslinjerProvider';


export default function TidslinjerView() {
  const { tidslinjer } = useContext(TidslinjeContext);
  const { filters } = useContext(FilterContext)
  const { colors } = useContext(ColorContext)
  const { lineStyles } = useContext(LinestyleContext)
  const [screenshot, setScreenshot] = useState("")
  const [kompakteEgenskaper, setKompakteEgenskaper] = useState(false)

  const visningsTidslinjer: Tidslinje[] = tidslinjer

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
        colors,
        lineStyles,
        4
      )
    }

    visualiser()

  }, [
    colors,
    lineStyles,
    tidslinjer,
    filters,
    kompakteEgenskaper
  ]);

  return (
    <VStack maxWidth={'95vw'}>
      <HStack>
        <Tooltip label={'Vis kun verdiene for egenskapene (ikke type)'}>
          <FormControl display='flex' alignItems='center'>
            <Checkbox
              id='kompakte-egenskaper'
              isChecked={kompakteEgenskaper}
              onChange={e => setKompakteEgenskaper(e.target.checked)}
            />
            <FormLabel htmlFor='kompakte-egenskaper' mx='1' mb='0'>
              Kompakte egenskaper
            </FormLabel>
          </FormControl>
        </Tooltip>
      </HStack>
      <Box
        alignItems={'left'}
        rounded='xl'
        border={'2px'}
        borderColor={'blackAlpha.200'}
        shadow={'lg'}
        maxW='100%'
        overflow={'auto'}
        paddingX={'5em'}
        paddingY={'1em'}
      >
        <div ref={containerRef}>
          <svg ref={wrapperRef}>
            <g ref={tidslinjeRef} />
            <g ref={xAxisRef} />
          </svg>
        </div>
      </Box>
    </VStack >
  );
}