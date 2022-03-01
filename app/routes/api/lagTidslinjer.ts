import { JSDOM } from 'jsdom';
import { ActionFunction } from "remix";
import { tegnTidslinjer } from '~/components/TidslinjeTegner';
import CSVTidslinjeparser from "~/parsers/CSVTidslinjeparser";

export const action: ActionFunction = async ({ request }) => {
    const body = await request.json()
    const csv = body.csv
    const delimiter = body.delimiter || ";"
    const identifikatorIndex = body.identifikatorIndex || 0
    const fraOgMedIndex = body.fraOgMedIndex || 1
    const tilOgMedIndex = body.tilOgMedIndex || 2

    if (!csv?.length) {
        return new Response(`Mottok ikke forventet felt "csv" (liste med csv-rader med delimiter "${delimiter}")`, {
            status: 400
        })
    }
    const props = {
        delimiter,
        identifikatorIndex,
        fraOgMedIndex,
        tilOgMedIndex
    }
    const parser = new CSVTidslinjeparser(props)
    const data = csv
    const tidslinjer = parser.parse(data)

    const document = new JSDOM(`
      <div>
        <svg >
          <g />
          <g >
            <g className="x-axis" />
          </g>
        </svg>
      </div>
    `).window.document

    console.log(document.querySelectorAll('g'))
    const container = document.querySelector('div') as HTMLDivElement
    const svg = document.querySelectorAll('g')[0] as SVGSVGElement
    const xAxis = document.querySelectorAll('g')[1] as SVGSVGElement
    const wrapper = document.querySelectorAll('svg')[0] as SVGSVGElement

    await tegnTidslinjer(
        svg,
        xAxis,
        container,
        dimensions,
        false,
        tidslinjer,
        new Map(),
        new Map()
    )
    console.log(container.innerHTML)

    return new Response(`<svg>${wrapper.innerHTML}</svg>`,
        {
            status: 200,
            headers: {
                "Content-Type": "image/svg+xml"
            }
        })
}