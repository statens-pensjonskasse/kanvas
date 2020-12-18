import { useRef, useEffect } from "react";
import { select, min, max, scaleLinear, axisBottom, scalePoint } from "d3";
import { DateTime } from "luxon";
import ReactTooltip from 'react-tooltip';

import useResizeObserver from "../util/useResizeObserver";

function Tidslinjer(props) {
  const colors = props.colors;
  const data = props.perioder;

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
    const allDates = data.flatMap(
      periode => [periode.fraOgMed, periode.tilOgMed]
    )
      .flatMap(x => x)
      .filter(x => !!x)
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

    const allLabels = new Set([...data.map(periode => periode.label)])
    const timelineHeight = 100;
    const numLabels = Math.max(allLabels.size, 5);
    const height = numLabels * timelineHeight;

    svg.style("height", `${height}px`)

    const yScale = scaleLinear()
      .domain([numLabels, 0])
      .range([timelineHeight, height]);

    svg
      .selectAll(".periode")
      .data(data)
      .join("line")
      .attr("data-tip", periode => periode.label)
      .attr("class", periode => periode.tilOgMed ? "periode" : "periode running")
      .attr("stroke", periode => colors.get(periode.label) || "black")
      .attr("stroke-width", 2)
      .attr("x1", periode => xScale(periode.fraOgMed))
      .attr("y1", periode => yScale(periode.posisjon))
      .attr("x2", periode => xScale(periode.tilOgMed || endDate))
      .attr("y2", periode => yScale(periode.posisjon));

    svg
      .selectAll(".periodeStartDelimiter")
      .data(data)
      .join("line")
      .attr("class", "periodeStartDelimiter")
      .attr("stroke", periode => colors.get(periode.label) || "black")
      .attr("stroke-width", 2)
      .attr("x1", periode => xScale(periode.fraOgMed))
      .attr("y1", periode => yScale(periode.posisjon) + 5)
      .attr("x2", periode => xScale(periode.fraOgMed))
      .attr("y2", periode => yScale(periode.posisjon) - 5);

    svg
      .selectAll(".periodeSluttDelimiter")
      .data(data.filter(periode => !!periode.tilOgMed))
      .join("line")
      .attr("class", "periodeStartDelimiter")
      .attr("stroke", periode => colors.get(periode.label) || "black")
      .attr("stroke-width", 2)
      .attr("x1", periode => xScale(periode.tilOgMed || endDate))
      .attr("y1", periode => yScale(periode.posisjon) + 5)
      .attr("x2", periode => xScale(periode.tilOgMed || endDate))
      .attr("y2", periode => yScale(periode.posisjon) - 5);

    svg
      .selectAll(".periodeEgenskaper")
      .data(data)
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
      .data(data)
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
      .selectAll(".periodeLabel")
      .data(data)
      .join("text")
      .attr("class", "periodeLabel")
      .attr("fill", periode => colors.get(periode.label) || "black")
      .attr("x", xScale(startDate) + 20)
      .attr("y", periode => yScale(periode.posisjon))
      .text(periode => periode.label)

    xAxis
      .select(".x-axis")
      .style("font-size", "0.8em")
      .call(
        axisBottom(xScale)
          .tickFormat(
            dato => [startDate, endDate].includes(dato) ?
              "" :
              DateTime.fromJSDate(dato).toFormat('yyyy.MM.dd')
          )
      );


    // draw the gauge
  }, [colors, data, dimensions]);

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
