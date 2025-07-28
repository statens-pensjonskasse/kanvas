import type { LoaderFunctionArgs } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const host = new URL(request.url).host

    const response = await fetch(`http://${host}/api/lagTidslinjer`, {
        method: 'post',
        body: JSON.stringify({
            data: ["POLISE;2000;2010;Polisestatus: Aktiv"]
        })
    })

    if (response.status != 200) {
        return new Response(`Intern feil: ${await response.text()}`, {
            status: 500,
        })

    }

    return new Response('Healthy 1', {
        status: 200
    })
}