import { Button, Container, FormControl, FormLabel, HStack, Switch, useToast } from "@chakra-ui/react";
import { axisBottom, max, min, scaleLinear, scalePoint, select } from "d3";
import html2canvas from "html2canvas";
import { DateTime } from "luxon";
import { useContext, useEffect, useRef, useState } from "react";
import { ColorContext } from "../state/ColorProvider";
import { FilterContext } from "../state/FilterProvider";
import { PandavarehusContext } from "../state/PandavarehusProvider";
import { TidslinjeContext } from '../state/TidslinjerProvider';
import useResizeObserver from "../util/useResizeObserver";
import { useStickyState } from "../util/useStickyState";


export default function TidslinjerView() {
  const { tidslinjer } = useContext(TidslinjeContext);
  const { filters } = useContext(FilterContext)
  const { colors } = useContext(ColorContext)
  const { tidslinjehendelse } = useContext(PandavarehusContext)
  const toast = useToast()
  const [kompakteEgenskaper, setKompakteEgenskaper] = useStickyState(true, "kompakte-egenskaper")

  const svgRef = useRef();
  const xAxisRef = useRef();
  const wrapperRef = useRef();
  const dimensions = useResizeObserver(wrapperRef);

  const kortNedEgenskap = egenskap => {
    const separated = egenskap.split(":")
    if (separated.length > 1) {
      return separated.slice(1).join(":")
    }
    return egenskap
  }

  const filtrerEgenskaper = (egenskaper, filter) => {
    return egenskaper
      .filter(e => filter?.test(e) ?? true)
      .map(e => filter?.test(e) ?? false ? e.replace(/^.+: ?/g, "") : e) // henter ut verdien dersom det finnes et filter
      .filter(e => e !== "")
  }

  useEffect(() => {
    const svg = select(svgRef.current);
    const xAxis = select(xAxisRef.current);
    if (!dimensions) return;

    // finner alle datoer som skal på x-aksen
    const allDates = tidslinjer.flatMap(
      tidslinje => tidslinje.datoer
    )
      .flatMap(x => x)
      .filter((date, i, self) =>
        self.findIndex(d => d.getTime() === date.getTime()) === i
      )
    allDates.sort((a, b) => a - b)

    const startDate = allDates.size > 1 ? DateTime.fromJSDate((min(allDates))) : DateTime.fromMillis(-8640000000000000);
    const endDate = tidslinjer.some(tidslinje => !!!tidslinje.tilOgMed) ? DateTime.fromMillis(8640000000000000) : DateTime.fromJSDate(max(allDates));

    const xScale = scalePoint()
      .domain([
        startDate,
        ...allDates,
        endDate
      ])
      .range([0, dimensions.width - 1]);


    const numTimelines = Math.max(4, tidslinjer.length) + 1
    const periodeStrl = Math.max(...(tidslinjer
      .flatMap(t => [...t.perioder.map(p => p.egenskaper), [t.label]])
      .flatMap(
        egenskaper => ([
          egenskaper.filter(egenskap => egenskap.startsWith("_")).join(", ").length,
          egenskaper.filter(egenskap => !egenskap.startsWith("_")).join(", ").length
        ])
      )
    ))
    const periodeBredde = Math.min(periodeStrl, 25)
    const antallPeriodeBredde = Math.max(allDates.length, 3)

    const timelineHeight = 100;
    const height = numTimelines * timelineHeight;

    svg.style("height", `${height}px`)
    select(wrapperRef.current).style("min-width", `${antallPeriodeBredde * periodeBredde}em`)

    const yScale = scaleLinear()
      .domain([numTimelines, -1])
      .range([0, height]);

    const lagVisbarTekst = (tidslinje, periode, egenskapVelger) => {
      // maks bokstaver som kan vises avhenger av lengden på perioden og hvorvidt perioden er den siste i tidslinjen
      const maksBokstaver = 0.13 * (xScale((periode.tilOgMed?.getTime() === tidslinje.tilOgMed?.getTime() ? endDate : periode.tilOgMed) || endDate) - xScale(periode.fraOgMed))
      const antallPerioder = tidslinje.perioder.length
      const filter = filters.get(tidslinje.label)
      const filtrerteEgenskaper = filtrerEgenskaper(periode.egenskaper, filter)
      const fullTekst = Object.values(filtrerteEgenskaper)
        .map(egenskap => egenskap.trim())
        .filter(egenskapVelger)
        .map(egenskap => egenskap.replace(/^_/, ''))
        .map(egenskap => kompakteEgenskaper ? kortNedEgenskap(egenskap) : egenskap)
        .join(", ")

      return (antallPerioder <= 1 || fullTekst.length < maksBokstaver) ? fullTekst : fullTekst
        .slice(0, maksBokstaver)
        .replace(/.{3}$/g, "...")
    }

    const tilpassedePerioder = tidslinjer
      .flatMap(
        tidslinje => {
          return tidslinje.perioder
            .map(
              periode => Object.assign(
                periode,
                {
                  posisjon: tidslinje.posisjon,
                  fullTekstOver: lagVisbarTekst(tidslinje, periode, egenskap => !egenskap.startsWith("_")),
                  fullTekstUnder: lagVisbarTekst(tidslinje, periode, egenskap => egenskap.startsWith("_"))
                }
              )
            )
        }
      )


    svg
      .selectAll(".tidslinje")
      .data(tidslinjer.flatMap(t => t.perioder))
      .join("line")
      .attr("data-tip", tidslinje => tidslinje.label)
      .attr("class", tidslinje => tidslinje.tilOgMed ? "tidslinje" : "tidslinje running")
      .attr("stroke", tidslinje => colors.get(tidslinje.label) || "black")
      .attr("stroke-width", 2)
      .attr("x1", tidslinje => xScale(tidslinje.fraOgMed))
      .attr("y1", tidslinje => yScale(tidslinje.posisjon))
      .attr("x2", tidslinje => xScale(tidslinje.tilOgMed || endDate))
      .attr("y2", tidslinje => yScale(tidslinje.posisjon));

    svg
      .selectAll(".periodeDelimiter")
      .data(tidslinjer.flatMap(
        tidslinje => tidslinje.datoer.map(
          dato => ({
            label: tidslinje.label,
            dato: dato,
            posisjon: tidslinje.posisjon,
            color: colors.get(tidslinje.label) || "black"
          })
        )
      ))
      .join("line")
      .attr("class", "periodeDelimiter")
      .attr("stroke", periode => periode.color)
      .attr("stroke-width", 2)
      .attr("x1", periode => xScale(periode.dato))
      .attr("y1", periode => yScale(periode.posisjon) + 5)
      .attr("x2", periode => xScale(periode.dato))
      .attr("y2", periode => yScale(periode.posisjon) - 5);

    svg
      .selectAll(".periodeEgenskaper")
      .data(tilpassedePerioder)
      .join("text")
      .attr("class", "periodeEgenskaper")
      .attr("fill", periode => colors.get(periode.label) || "black")
      .attr("x", periode => xScale(periode.fraOgMed) + 20)
      .attr("y", periode => yScale(periode.posisjon) - 10)
      .text(periode => periode.fullTekstOver);

    svg
      .selectAll(".periodeUndertekst")
      .data(tilpassedePerioder)
      .join("text")
      .attr('class', 'periodeUndertekst')
      .attr("fill", periode => colors.get(periode.label) || "black")
      .attr("x", periode => xScale(periode.fraOgMed) + 20)
      .attr("y", periode => yScale(periode.posisjon) + 20)
      .text(periode => periode.fullTekstUnder);

    svg
      .selectAll(".tidslinjeLabel")
      .data(tidslinjer)
      .join("text")
      .attr("class", "tidslinjeLabel")
      .attr("fill", tidslinje => tidslinjehendelse?.TidslinjeId === tidslinje.label? "red":  colors.get(tidslinje.label) || "black")
      .attr("x", xScale(startDate) + 20)
      .attr("y", tidslinje => yScale(tidslinje.posisjon) + (timelineHeight / 15))
      .text(tidslinje => tidslinje.label.slice(0, 40))

    xAxis
      .select(".x-axis")
      .style("font-size", "0.9em")
      .call(
        axisBottom(xScale)
          .tickFormat(
            dato => [startDate, endDate].includes(dato) ?
              "" :
              DateTime.fromJSDate(dato).toFormat('d.M.yyyy')
          )
      );


  }, [colors, tidslinjer, filters, dimensions, kompakteEgenskaper]);

  const saveScreenshot = async () => {
    const canvas = await html2canvas(wrapperRef.current)
    await canvas.toBlob(
      blob => navigator.clipboard
        .write([
          new window.ClipboardItem(
            Object.defineProperty({}, blob.type, {
              value: blob,
              enumerable: true
            })
          )
        ])
    )

    toast({
      description: "Kopierte skjermbilde til utklippstavla",
    })
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
        <Button colorScheme={'blue'} onClick={saveScreenshot}>Kopier skjermbilde</Button>
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