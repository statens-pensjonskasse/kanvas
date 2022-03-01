import { JSDOM } from 'jsdom';
import { ActionFunction } from "remix";
import { tegnTidslinjer } from '~/components/TidslinjeTegner';
import CSVTidslinjeparser from "~/parsers/CSVTidslinjeparser";

export const action: ActionFunction = async ({ request }) => {
  const body = await request.json()
  const csv = body.data
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
        <svg class="kanvas-wrapper">
          <g class="kanvas-tidslinjer" />
          <g class="kanvas-axis"/>
        </svg>
      </div>
    `).window.document

  const container = document.querySelector('.kanvas-wrapper') as SVGSVGElement
  const svg = document.querySelector('.kanvas-tidslinjer') as SVGSVGElement
  const xAxis = document.querySelector('.kanvas-axis') as SVGSVGElement

  await tegnTidslinjer(
    svg,
    xAxis,
    container,
    false,
    tidslinjer,
    new Map(),
    new Map()
  )

  return new Response(container.outerHTML,
    {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml"
      }
    })
}