import { Aksjonsdato } from '~/domain/Aksjonsdato';
import Periode from '~/domain/Periode';
import Tidslinje from '~/domain/Tidslinje';


const kortNedEgenskap = (egenskap: string) => {
    const separated = egenskap.split(":")
    if (separated.length > 1) {
        return separated.slice(1).join(":")
    }
    return egenskap
}

const filtrerEgenskaper = (egenskaper: string[], filter: RegExp): string[] => {
    return egenskaper
        .filter(e => filter?.test(e) ?? true)
}


/**
 * 
 * @param svgRef Referanse til DOM-element der tidslinjene tegnes
 * @param xAxisRef separat DOM-element for x-aksen
 * @param wrapperRef en div-wrapper for tidslinjen og x-aksen
 * @param kompakteEgenskaper Boolean som sier om typen på egenskapen skal vises eller ikke
 * @param tidslinjer Tidslinjene som skal tegnes
 * @param filters Filtre på hvilke egenskaper som skal vises
 * @param colors Farger for tidslinjer
 */
export async function tegnTidslinjer(
    svgRef: SVGSVGElement,
    xAxisRef: SVGSVGElement,
    containerRef: SVGSVGElement,
    kompakteEgenskaper: boolean,
    tidslinjer: Tidslinje[],
    filters: Map<string, RegExp>,
    colors: Map<string, string>
) {
    if (!tidslinjer?.length) {
        console.warn("Fant ingen tidslinjer")
        return
    }
    const { max, axisBottom, scaleLinear, scalePoint, select } = await import('d3');
    const svg = select(svgRef);
    const xAxis = select(xAxisRef);
    const container = select(containerRef)

    // finner alle datoer som skal på x-aksen
    const allDates: Aksjonsdato[] = tidslinjer
        .flatMap(
            tidslinje => tidslinje.datoer
        )
        .flatMap(x => x)
        .filter((date, i, self) =>
            self.findIndex(d => d.getTime() === date.getTime()) === i
        )
        .sort((a, b) => a.getTime() - b.getTime())

    const startDate = Aksjonsdato.TIDENES_MORGEN;
    const endDate: Aksjonsdato = tidslinjer.some(tidslinje => tidslinje.erLøpende()) ? Aksjonsdato.TIDENES_SLUTT : allDates[allDates.length - 1]; // TODO finn største verdi

    const numTimelines = tidslinjer.length || 0
    const periodeStrl = Math.max(
        0,
        ...(tidslinjer
            .flatMap(t => [...t.perioder.map(p => p.egenskaper), [t.label]])
            .flatMap(
                egenskaper => ([
                    egenskaper.filter(egenskap => egenskap.startsWith("_")).join(", ").length,
                    egenskaper.filter(egenskap => !egenskap.startsWith("_")).join(", ").length
                ])
            )
        )
    )
    const periodeBredde = Math.min(periodeStrl, 25) * 16 // 16px
    const antallPeriodeBredde = Math.max(allDates.length, 3)
    const width = periodeBredde * antallPeriodeBredde

    const timelineHeight = 100;
    const height = numTimelines * timelineHeight;

    const xScale = scalePoint()
        .domain([
            startDate.aksjonsdato,
            ...allDates.map(d => d.aksjonsdato).sort(),
            endDate.aksjonsdato
        ])
        .range([0, width - 1]);

    container.style("min-width", `${width + 32}px`)
    container.style("min-height", `${height + timelineHeight}px`)

    const yScale = scaleLinear()
        .domain([numTimelines, -1])
        .range([timelineHeight / 2, height + timelineHeight / 2]);

    const lagVisbarTekst = (tidslinje: Tidslinje, periode: Periode, egenskapVelger: (egenskap: string) => boolean) => {
        // maks bokstaver som kan vises avhenger av lengden på perioden og hvorvidt perioden er den siste i tidslinjen
        const maksBokstaver = 0.13 * (xScale((periode.tilOgMed?.aksjonsdato === tidslinje.tilOgMed?.aksjonsdato ? endDate.aksjonsdato : periode.tilOgMed.aksjonsdato) || endDate.aksjonsdato) - xScale(periode.fraOgMed.aksjonsdato))
        const antallPerioder = tidslinje.perioder.length
        const filter = filters.get(tidslinje.label)
        const filtrerteEgenskaper: string[] = filtrerEgenskaper(periode.egenskaper, filter)
        const fullTekst = filtrerteEgenskaper
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
        .attr("x1", tidslinje => xScale(tidslinje.fraOgMed.aksjonsdato))
        .attr("y1", tidslinje => yScale(tidslinje.posisjon))
        .attr("x2", tidslinje => xScale(tidslinje.tilOgMed?.aksjonsdato || endDate.aksjonsdato))
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
        .attr("x1", periode => xScale(periode.dato.aksjonsdato))
        .attr("y1", periode => yScale(periode.posisjon) + 5)
        .attr("x2", periode => xScale(periode.dato.aksjonsdato))
        .attr("y2", periode => yScale(periode.posisjon) - 5);

    svg
        .selectAll(".periodeEgenskaper")
        .data(tilpassedePerioder)
        .join("text")
        .attr("class", "periodeEgenskaper")
        .attr("fill", periode => colors.get(periode.label) || "black")
        .attr("x", periode => xScale(periode.fraOgMed.aksjonsdato) + 20)
        .attr("y", periode => yScale(periode.posisjon) - 10)
        .text(periode => periode.fullTekstOver);

    svg
        .selectAll(".periodeUndertekst")
        .data(tilpassedePerioder)
        .join("text")
        .attr('class', 'periodeUndertekst')
        .attr("fill", periode => colors.get(periode.label) || "black")
        .attr("x", periode => xScale(periode.fraOgMed.aksjonsdato) + 20)
        .attr("y", periode => yScale(periode.posisjon) + 20)
        .text(periode => periode.fullTekstUnder);

    svg
        .selectAll(".tidslinjeLabel")
        .data(tidslinjer)
        .join("text")
        .attr("class", "tidslinjeLabel")
        .attr("fill", tidslinje => (colors.get(tidslinje.label) || "black"))
        .attr("x", xScale(startDate.aksjonsdato) + 20)
        .attr("y", tidslinje => yScale(tidslinje.posisjon) + (timelineHeight / 15))
        .text(tidslinje => tidslinje.label.slice(0, periodeBredde))

    xAxis
        .attr('width', width)
        .attr('transform', `translate(0, ${height + timelineHeight / 2})`)
        .style("font-size", "0.9em")
        .call(
            axisBottom(xScale)
                .tickFormat(
                    dato => [startDate.aksjonsdato, endDate.aksjonsdato].includes(dato) ?
                        "" :
                        dato
                )
        );
}