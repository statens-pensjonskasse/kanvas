import { Button, Container, useToast } from "@chakra-ui/react";
import { axisBottom, max, min, scaleLinear, scalePoint, select } from "d3";
import { DateTime } from "luxon";
import { useContext, useEffect, useRef } from "react";
import ReactTooltip from 'react-tooltip';
import { ColorContext } from "../state/ColorProvider";
import { FilterContext } from "../state/FilterProvider";
import { TidslinjeContext } from '../state/TidslinjerProvider';
import useResizeObserver from "../util/useResizeObserver";
import html2canvas from "html2canvas";


export default function TidslinjerView() {
  const { tidslinjer } = useContext(TidslinjeContext);
  const { filters } = useContext(FilterContext)
  const { colors } = useContext(ColorContext)
  const toast = useToast()

  const svgRef = useRef();
  const xAxisRef = useRef();
  const wrapperRef = useRef();
  const dimensions = useResizeObserver(wrapperRef);

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


    const numTimelines = Math.max(...tidslinjer.map(t => t.posisjon), 5) - 1

    const timelineHeight = 150;
    const height = numTimelines * timelineHeight;

    svg.style("height", `${height}px`)

    const yScale = scaleLinear()
      .domain([numTimelines, 0])
      .range([timelineHeight * 2, height]);

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
      .data(
        tidslinjer
          .flatMap(
            tidslinje => {
              const filter = filters.get(tidslinje.label)
              return tidslinje.perioder.map(
                periode => Object.assign(
                  periode,
                  {
                    // maks bokstaver som kan vises avhenger av lengden på perioden og hvorvidt perioden er den siste i tidslinjen
                    maksBokstaver: 0.13 * (xScale((periode.tilOgMed?.getTime() === tidslinje.tilOgMed?.getTime() ? endDate : periode.tilOgMed) || endDate) - xScale(periode.fraOgMed)),
                    antallPerioder: tidslinje.perioder.length,
                    filtrerteEgenskaper: periode.egenskaper
                      .filter(egenskap => !egenskap.startsWith("_"))
                      .filter(e => filter?.test(e) ?? true)
                      .map(e => filter?.test(e) ?? false ? e.replace(/^.+: ?/g, "") : e) // henter ut verdien dersom det finnes et filter
                      .filter(e => e !== "")
                  }
                )
              )
            }
          )
      )
      .join("text")
      .attr("class", "periodeEgenskaper")
      .attr("fill", periode => colors.get(periode.label) || "black")
      .attr("x", periode => xScale(periode.fraOgMed) + 20)
      .attr("y", periode => yScale(periode.posisjon) - 10)
      .text(
        periode => {
          const fullTekst = Object.values(periode.filtrerteEgenskaper)
            .map(egenskap => egenskap.trim())
            .filter(egenskap => !egenskap.startsWith("_"))
            .map(egenskap => egenskap.split(":").length > 1? egenskap.split(":")[1].trim(): egenskap)
            .join(", ")

          return (periode.antallPerioder <= 1 || fullTekst.length < periode.maksBokstaver) ? fullTekst : fullTekst
            .slice(0, periode.maksBokstaver)
            .replace(/.{3}$/g, "...")
        }
      );

    svg
      .selectAll(".periodeUndertekst")
      .data(
        tidslinjer
          .flatMap(
            tidslinje => {
              const filter = filters.get(tidslinje.label)
              return tidslinje.perioder.map(
                periode => Object.assign(
                  periode,
                  {
                    // maks bokstaver som kan vises avhenger av lengden på perioden og hvorvidt perioden er den siste i tidslinjen
                    maksBokstaver: 0.13 * (xScale((periode.tilOgMed?.getTime() === tidslinje.tilOgMed?.getTime() ? endDate : periode.tilOgMed) || endDate) - xScale(periode.fraOgMed)),
                    antallPerioder: tidslinje.perioder.length,
                    filtrerteEgenskaper: periode.egenskaper
                      .filter(e => e.startsWith("_"))
                      .filter(e => filter?.test(e.slice(1)) ?? true)
                      .map(e => filter?.test(e) ?? false ? e.replace(/^.+: ?/g, "_") : e) // henter kun ut verdien dersom det finnes et filter
                      .filter(e => e !== "_")
                  }
                )
              )
            }
          )
      )
      .join("text")
      .attr('class', 'periodeUndertekst')
      .attr("fill", periode => colors.get(periode.label) || "black")
      .attr("x", periode => xScale(periode.fraOgMed) + 20)
      .attr("y", periode => yScale(periode.posisjon) + 20)
      .text(
        periode => {
          const fullTekst = Object.values(periode.filtrerteEgenskaper)
            .map(egenskap => egenskap.trim())
            .filter(egenskap => egenskap.startsWith("_"))
            .map(egenskap => egenskap.slice(1))
            .map(egenskap => egenskap.split(":").length > 1? egenskap.split(":")[1].trim(): egenskap)
            .join(", ")

          return (periode.antallPerioder <= 1 || fullTekst.length < periode.maksBokstaver) ? fullTekst : fullTekst
            .slice(0, periode.maksBokstaver)
            .replace(/.{3}$/g, "...")
        }
      );

    svg
      .selectAll(".tidslinjeLabel")
      .data(tidslinjer)
      .join("text")
      .attr("class", "tidslinjeLabel")
      .attr("fill", tidslinje => colors.get(tidslinje.label) || "black")
      .attr("x", xScale(startDate) + 20)
      .attr("y", tidslinje => yScale(tidslinje.posisjon) + (timelineHeight / 15))
      .text(tidslinje => tidslinje.label)

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


  }, [colors, tidslinjer, filters, dimensions]);

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
      maxWidth={'95vw'}
      padding={'5'}
    >
      <Container ref={wrapperRef} maxWidth={'100%'} marginBottom={'10'}>
        <svg ref={svgRef} width={'100%'} />
        <svg ref={xAxisRef} width={'110%'} height={'2em'} >
          <g className="x-axis" />
        </svg>
      </Container>
      <Button onClick={saveScreenshot}>Kopier skjermbilde</Button>
    </Container>

  );
}