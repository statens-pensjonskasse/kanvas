import { useRef, useEffect } from "react";
import { select, min, max, scaleLinear, axisBottom, scalePoint } from "d3";
import { DateTime } from "luxon";
import ReactTooltip from 'react-tooltip';

import useResizeObserver from "../util/useResizeObserver";

function Tidslinjer(props) {
  const colors = props.colors;
  const tidslinjer = props.tidslinjer;

  const svgRef = useRef();
  const xAxisRef = useRef();
  const wrapperRef = useRef();
  const dimensions = useResizeObserver(wrapperRef);

  // will be called initially and on every data change
  useEffect(() => {
    const svg = select(svgRef.current);
    const xAxis = select(xAxisRef.current);
    if (!dimensions) return;

    // finner alle datoer som skal på x-aksen
    const allDates = tidslinjer.flatMap(
      tidslinje => tidslinje.datoer
    )
      .flatMap(x => x)
    allDates.sort((a, b) => a - b)

    const startDate = DateTime.fromJSDate((min(allDates)));
    const endDate = DateTime.fromJSDate(max(allDates));

    const xScale = scalePoint()
      .domain([
        startDate,
        ...allDates,
        endDate
      ])
      .range([0, dimensions.width - 1]);

    const allLabels = new Set([...tidslinjer.map(tidslinje => tidslinje.label)])
    const timelineHeight = 100;
    const numLabels = Math.max(allLabels.size, 5);
    const height = numLabels * timelineHeight;

    svg.style("height", `${height}px`)

    const yScale = scaleLinear()
      .domain([numLabels, 0])
      .range([timelineHeight, height]);

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
      .data(tidslinjer.flatMap(tidslinje => tidslinje.perioder))
      .join("text")
      .attr("class", "periodeEgenskaper")
      .attr("fill", periode => colors.get(periode.label) || "black")
      .attr("x", periode => xScale(periode.fraOgMed) + 20)
      .attr("y", periode => yScale(periode.posisjon) - (timelineHeight / 10))
      .text(
        periode => Object.values(periode.egenskaper)
          .map(egenskap => egenskap.trim())
          .filter(egenskap => !egenskap.startsWith("_"))
          .join(", ")
      );

    svg
      .selectAll(".periodeUndertekst")
      .data(tidslinjer.flatMap(tidslinje => tidslinje.perioder))
      .join("text")
      .attr('class', 'periodeEgenskaper')
      .attr("fill", periode => colors.get(periode.label) || "black")
      .attr("x", periode => xScale(periode.fraOgMed) + 20)
      .attr("y", periode => yScale(periode.posisjon) + (timelineHeight / 5))
      .text(
        periode => Object.values(periode.egenskaper)
          .map(egenskap => egenskap.trim())
          .filter(egenskap => egenskap.startsWith("_"))
          .map(egenskap => egenskap.slice(1))
          .join(", ")
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
      .style("font-size", "0.8em")
      .call(
        axisBottom(xScale)
          .tickFormat(
            dato => [startDate, endDate].includes(dato) ?
              "" :
              DateTime.fromJSDate(dato).toFormat('d.M.yyyy')
          )
      );


    // draw the gauge
  }, [colors, tidslinjer, dimensions]);

  return (
    <div className="svg-wrapper">
      <div ref={wrapperRef} className="svg-timeline-wrapper">
        <svg ref={svgRef} className="svg-timelines" />
      </div>
      <div>
        <svg ref={xAxisRef} className="svg-x-axis">
          <g className="x-axis" />
        </svg>
        <ReactTooltip multiline />
      </div>

    </div>

  );
}

export default Tidslinjer;
