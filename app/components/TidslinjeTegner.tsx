import { Aksjonsdato } from '~/domain/Aksjonsdato';
import Periode from '~/domain/Periode';
import Tidslinje from '~/domain/Tidslinje';
import {LinestyleKey, Tidsspenn} from "~/parsers/CSVLinestyleparser";


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

const linestyleOppslag = (oppslagsverk: Map<string, string>, periode: Periode): string => {
    const tidslinjeKey = new LinestyleKey(periode.label).key()
    const periodeKey = new LinestyleKey(periode.label, new Tidsspenn(periode.fraOgMed, periode.tilOgMed || Aksjonsdato.TIDENES_SLUTT)).key()

    const bruktKey = oppslagsverk.has(periodeKey) ? periodeKey : tidslinjeKey

    return oppslagsverk.get(bruktKey) || "solid"
}

const konverterStroke = (linestyle: string)=> {
    switch (linestyle) {
        case "solid":
            return "1, 0"
        case "dashed2":
            return "1, 2"
        case "dashed3":
            return "1, 3"
        case "dashed4":
            return "1, 4"
        case "dashed5":
            return "1, 5"
        case "dashed6":
            return "1, 6"
        case "dashed7":
            return "1, 7"
        case "dashed8":
            return "1, 8"
        case "dashed9":
            return "1, 9"
        case "dashed10":
            return "1, 10"
        default:
            return "1, 0"
    }
}

/**
 * 
 * @param svgRef Referanse til DOM-element der tidslinjene tegnes
 * @param xAxisRef separat DOM-element for x-aksen
 * @param containerRef en div-wrapper for tidslinjen og x-aksen
 * @param kompakteEgenskaper Boolean som sier om typen på egenskapen skal vises eller ikke
 * @param tidslinjer Tidslinjene som skal tegnes
 * @param filters Filtre på hvilke egenskaper som skal vises
 * @param colors Farger for tidslinjer
 * @param lineStyles Linjestil for tidslinjer
 * @param minAntallTidslinjer er minimum antall tidslinjer
 */
export async function tegnTidslinjer(
    svgRef: SVGSVGElement,
    xAxisRef: SVGSVGElement,
    containerRef: SVGSVGElement,
    kompakteEgenskaper: boolean,
    tidslinjer: Tidslinje[],
    filters: Map<string, RegExp>,
    colors: Map<string, string>,
    lineStyles: Map<LinestyleKey, string>,
    minAntallTidslinjer: number = 0
) {
    const { axisBottom, scaleLinear, scalePoint, select } = await import('d3');
    const svg = select(svgRef);
    const xAxis = select(xAxisRef);
    const container = select(containerRef)

    if (!tidslinjer?.length) {
        console.warn("Fant ingen tidslinjer")
        return
    }

    // finner alle datoer som skal på x-aksen
    const allDates: Aksjonsdato[] = [
        ...tidslinjer
            .flatMap(
                tidslinje => tidslinje.datoer
            )
            .flatMap(x => x),
    ]
        .filter((date, i, self) =>
            self.findIndex(d => d.aksjonsdato === date.aksjonsdato) === i
        )
        .sort((a, b) => a.getTime() - b.getTime())

    if (allDates.length === 0) {
        return null
    }

    const startDate = Aksjonsdato.TIDENES_MORGEN;
    const endDate: Aksjonsdato = tidslinjer.some(tidslinje => tidslinje.erLøpende()) ? Aksjonsdato.TIDENES_SLUTT : allDates[allDates.length - 1]; // TODO finn største verdi

    const numTimelines = Math.max(tidslinjer.length, minAntallTidslinjer)

    const periodeBredde = 25 * 16 // 16px
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
        const maksBokstaver = 0.13 * (xScale((periode.tilOgMed?.aksjonsdato === tidslinje.tilOgMed?.aksjonsdato ? endDate.aksjonsdato : periode.tilOgMed?.aksjonsdato) || endDate.aksjonsdato) - xScale(periode.fraOgMed.aksjonsdato))
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

    const lineStylesKonvertert: Map<string, string> = new Map()
    lineStyles.forEach((value: string, key: LinestyleKey) => {
        lineStylesKonvertert.set(key.key(), value)
    })

    const tilpassedePerioder = tidslinjer
        .flatMap(
            tidslinje => {
                return tidslinje.perioder
                    .map(
                        periode => ({
                            ...periode,
                            ...{
                                posisjon: tidslinje.posisjon,
                                fullTekstOver: lagVisbarTekst(tidslinje, periode, egenskap => !egenskap.startsWith("_")),
                                fullTekstUnder: lagVisbarTekst(tidslinje, periode, egenskap => egenskap.startsWith("_")),
                                erKonsolidert: periode.label.toUpperCase().includes("POLISE") && Boolean(periode.egenskaper.filter(egenskap => egenskap.toUpperCase().trim().match(/\b(KONSOLIDERT)|(DØD)|(KNS)|(DOD)\b/g)).length),
                                color: colors.get(periode.label) || "black",
                                linestyle: linestyleOppslag(lineStylesKonvertert, periode)
                            }
                        })
                    )
            }
        )

    svg
        .selectAll(".tidslinje")
        .data(tilpassedePerioder)
        .join("line")
        .style("opacity", periode => periode.erKonsolidert ? "0.5" : "1")
        .attr("stroke-dasharray", periode => konverterStroke(periode.erKonsolidert ? "dashed10" : periode.linestyle))
        .attr("data-tip", tidslinje => tidslinje.label)
        .attr("class", periode => periode.tilOgMed ? "tidslinje" : "tidslinje running")
        .attr("stroke", periode => periode.color)
        .attr("stroke-width", 2)
        .attr("x1", periode => xScale(periode.fraOgMed.aksjonsdato))
        .attr("y1", periode => yScale(periode.posisjon))
        .attr("x2", periode => xScale(periode.tilOgMed?.aksjonsdato || endDate.aksjonsdato))
        .attr("y2", periode => yScale(periode.posisjon));

    svg
        .selectAll(".periodeDelimiter")
        .data(
            tidslinjer.flatMap(
                tidslinje => tidslinje.datoer
                    .filter(dato => dato !== Aksjonsdato.UKJENT_DATO)
                    .map(
                        dato => ({
                            label: tidslinje.label,
                            dato: dato,
                            posisjon: tidslinje.posisjon,
                            color: colors.get(tidslinje.label) || "black"
                        })
                    )
            )
        )
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
        .style("opacity", periode => periode.erKonsolidert ? "0.5" : "1")
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
        .style("opacity", periode => periode.erKonsolidert ? "0.5" : "1")
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
        .style("font-size", "1em")
        .call(
            axisBottom(xScale)
                .tickFormat(
                    dato => {
                        if ([startDate.aksjonsdato, endDate.aksjonsdato].includes(dato)) {
                            return ""
                        }
                        else if (dato === Aksjonsdato.UKJENT_DATO.aksjonsdato) {
                            return "Ukjent dato"
                        }
                        return dato
                    }
                )
        );
}