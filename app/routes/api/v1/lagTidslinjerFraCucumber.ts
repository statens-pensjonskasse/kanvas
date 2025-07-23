import type { ActionFunctionArgs } from "@remix-run/node";
import { parseHTML } from "linkedom";
import { tegnTidslinjer } from '~/components/TidslinjeTegner';
import GherkinTidslinjeparser from '~/parsers/GherkinTidslinjeparser';
import { cache } from '~/util/cache.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.json()
  const tekst = body.data
  const { kompakteEgenskaper = false } = body

  const cacheKey = JSON.stringify(body)
  const cacheResult = cache.get(cacheKey)

  if (cacheResult) {
    return new Response(
      cacheResult,
      {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml"
        }
      }
    )
  }

  if (!tekst?.length) {
    return new Response(`Mottok ikke forventet felt "data" (cucumber scenariotekst splittet på newline)"`, {
      status: 400
    })
  }
  const parser = new GherkinTidslinjeparser()
  const tidslinjer = parser.parse(tekst)

  const { document } = parseHTML(`
      <div>
        <svg class="kanvas-wrapper">
          <g class="kanvas-tidslinjer" />
          <g class="kanvas-axis"/>
        </svg>
      </div>
    `)

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
    new Map(),
    new Map()
  )

  cache.set(cacheKey, container.outerHTML)

  return new Response(
    container.outerHTML,
    {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml"
      }
    })
}