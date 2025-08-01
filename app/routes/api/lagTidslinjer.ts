import type { ActionFunctionArgs } from 'react-router';
import { parseHTML } from "linkedom";
import { tegnTidslinjer } from '~/components/TidslinjeTegner';
import Colorparser from '~/parsers/CSVColorparser';
import Filterparser from '~/parsers/CSVFilterparser';
import Linestyleparser from '~/parsers/CSVLinestyleparser';
import CSVTidslinjeparser from "~/parsers/CSVTidslinjeparser";
import { cache } from "~/util/cache.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.json()
  const csv = body.data
  const delimiter = body.delimiter || ";"
  const identifikatorIndex = body.identifikatorIndex || 0
  const fraOgMedIndex = body.fraOgMedIndex || 1
  const tilOgMedIndex = body.tilOgMedIndex || 2

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

  if (!csv?.length) {
    return new Response(`Mottok ikke forventet felt "data" (liste med csv-rader med delimiter "${delimiter}")`, {
      status: 400
    })
  }
  const props = {
    delimiter,
    identifikatorIndex,
    fraOgMedIndex,
    tilOgMedIndex
  }
  const tidslinjeParser = new CSVTidslinjeparser(props)
  const colorParser = new Colorparser({ delimiter })
  const lineStylesParser = new Linestyleparser({ delimiter })
  const filterParser = new Filterparser({ delimiter })

  const data = csv
  const tidslinjer = tidslinjeParser.parse(data)
  const colors = colorParser.parse(data)
  const lineStyles = lineStylesParser.parse(data)
  const filters = filterParser.parse(data)

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
    false,
    tidslinjer,
    filters,
    colors,
    lineStyles
  )

  cache.set(cacheKey, container.outerHTML)

  return new Response(
    container.outerHTML,
    {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml"
      }
    }
  )
}