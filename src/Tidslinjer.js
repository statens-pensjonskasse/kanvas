import React, { useRef, useEffect } from "react";
import { select, min, max, scaleLinear, axisBottom, scalePoint } from "d3";
import useResizeObserver from "./useResizeObserver";
import moment from "moment"

function Tidslinjer({ data }) {
  console.log(data)
  const svgRef = useRef();
  const wrapperRef = useRef();
  const dimensions = useResizeObserver(wrapperRef);

  // will be called initially and on every data change
  useEffect(() => {
    const svg = select(svgRef.current);
    if (!dimensions) return;

    // finner alle datoer som skal på x-aksen
    const allDates = data.flatMap(
      periode => [periode.fraOgMed, periode.tilOgMed]
    )
      .flatMap(x => x)
      .filter(x => !!x)
    allDates.sort((a, b) => a - b)

    console.log(allDates)

    const startDate = moment(min(allDates)).add(-1, "year");
    const endDate = moment(max(allDates)).add(1, "year");

    const xScale = scalePoint()
      .domain([
        startDate,
        ...allDates,
        endDate
      ])
      .range([0, dimensions.width]);

    const yScale = scaleLinear()
      .domain([10, 0])
      .range([0, dimensions.height]);

    svg
      .selectAll(".periode")
      .data(data)
      .join("line")
      .attr("class", periode => periode.tilOgMed? "periode" : "periode running")
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
      .attr("y", periode => yScale(periode.posisjon + 0.2))
      .text(periode => Object.values(periode.egenskaper).join(", "));

    svg
      .selectAll(".periodeLabel")
      .data(data)
      .join("text")
      .attr('class', 'periodeLabel')
      .attr("x", periode => xScale(startDate))
      .attr("y", periode => yScale(periode.posisjon + 0.2))
      .text(periode => periode.label)

    const xAxis = axisBottom(xScale)
      .tickFormat(
        dato => [startDate, endDate].includes(dato) ?
          "" :
          dato.format('YYYY.MM.DD')
      );

    svg
      .select(".x-axis")
      .style("transform", `translateY(${dimensions.height}px)`)
      .call(xAxis);

    // draw the gauge
  }, [data, dimensions]);

  return (
    <div ref={wrapperRef} style={{ marginBottom: "10rem" }}>
      <svg ref={svgRef}>
        <g className="x-axis" />
      </svg>
    </div>
  );
}

export default Tidslinjer;
