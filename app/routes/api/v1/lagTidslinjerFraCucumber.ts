import { JSDOM } from 'jsdom';
import { ActionFunction } from "remix";
import { tegnTidslinjer } from '~/components/TidslinjeTegner';
import GherkinTidslinjeparser from '~/parsers/GherkinTidslinjeparser';

export const action: ActionFunction = async ({ request }) => {
  const body = await request.json()
  const tekst = body.data
  const { kompakteEgenskaper = true } = body.data

  if (!tekst?.length) {
    return new Response(`Mottok ikke forventet felt "data" (cucumber scenariotekst splittet på newline)"`, {
      status: 400
    })
  }
  const parser = new GherkinTidslinjeparser()
  const tidslinjer = parser.parse(tekst)

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
    kompakteEgenskaper,
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