import React, { useRef, useEffect } from "react";
import { select, min, max, scaleLinear, axisBottom, scalePoint } from "d3";
import useResizeObserver from "../util/useResizeObserver";
import moment from "moment"
import 'moment/locale/nb'
moment.locale('nb')

function Tidslinjer({ data }) {
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

    const startDate = moment(min(allDates)).add(-1, "year");
    const endDate = moment(max(allDates)).add(1, "year");

    const xScale = scalePoint()
      .domain([
        startDate,
        ...allDates,
        endDate
      ])
      .range([0, dimensions.width-1]);

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
      .attr("class", periode => periode.tilOgMed ? "periode" : "periode running")
      .attr("stroke", "black")
      .attr("stroke-width", 1.5)
      .attr("x1", periode => xScale(periode.fraOgMed))
      .attr("y1", periode => yScale(periode.posisjon))
      .attr("x2", periode => xScale(periode.tilOgMed || endDate))
      .attr("y2", periode => yScale(periode.posisjon));

    svg
      .selectAll(".periodeStartDelimiter")
      .data(data)
      .join("line")
      .attr("class", "periodeStartDelimiter")
      .attr("stroke", "black")
      .attr("stroke-width", 1.5)
      .attr("x1", periode => xScale(periode.fraOgMed))
      .attr("y1", periode => yScale(periode.posisjon) + 5)
      .attr("x2", periode => xScale(periode.fraOgMed))
      .attr("y2", periode => yScale(periode.posisjon) - 5);

    svg
      .selectAll(".periodeSluttDelimiter")
      .data(data.filter(periode => !!periode.tilOgMed))
      .join("line")
      .attr("class", "periodeStartDelimiter")
      .attr("stroke", "black")
      .attr("stroke-width", 1.5)
      .attr("x1", periode => xScale(periode.tilOgMed || endDate))
      .attr("y1", periode => yScale(periode.posisjon) + 5)
      .attr("x2", periode => xScale(periode.tilOgMed || endDate))
      .attr("y2", periode => yScale(periode.posisjon) - 5);

    svg
      .selectAll(".periodeEgenskaper")
      .data(data)
      .join("text")
      .attr('class', 'periodeEgenskaper')
      .attr("x", periode => xScale(periode.fraOgMed) + 20)
      .attr("y", periode => yScale(periode.posisjon) - (timelineHeight/10))
      .text(periode => Object.values(periode.egenskaper).join(", "));

    svg
      .selectAll(".periodeLabel")
      .data(data)
      .join("text")
      .attr('class', 'periodeLabel')
      .attr("x", xScale(startDate)+20)
      .attr("y", periode => yScale(periode.posisjon))
      .text(periode => periode.label)

    const foo = axisBottom(xScale)
      .tickFormat(
        dato => [startDate, endDate].includes(dato) ?
          "" :
          moment(dato).format('YYYY.MM.DD')
      );

    xAxis
      .select(".x-axis")
      .style("transform", `translateY(0)`)
      .call(foo);


    // draw the gauge
  }, [data, dimensions]);

  return (
    <div className="svg-wrapper">
      <div ref={wrapperRef} className="svg-timeline-wrapper">
        <svg ref={svgRef} className="svg-timelines" />
      </div>
      <div>
        <svg ref={xAxisRef} className="svg-x-axis">
          <g className="x-axis" />
        </svg>
      </div>
    </div>

  );
}

export default Tidslinjer;
