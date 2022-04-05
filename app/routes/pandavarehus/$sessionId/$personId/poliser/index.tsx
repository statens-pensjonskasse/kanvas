import { Heading } from "@chakra-ui/react";
import React, { useContext, useEffect } from "react";
import { LoaderFunction, useLoaderData } from "remix";
import invariant from "ts-invariant";
import TidslinjerView from "~/components/TidslinjeView";
import Tidslinje from "~/domain/Tidslinje";
import PandavarehusPoliserParser from "~/parsers/pandavarehus/PandavarehusPoliserParser";
import { PandavarehusContext } from '~/state/PandavarehusProvider';


export const loader: LoaderFunction = async ({ params, request }) => {
    const { personId, sessionId } = params
    const BASE_URL = new URL(request.url).origin

    if (!personId) {
        return new Response('Mangler personId', {
            status: 400
        })
    }

    let dataForrige: Response;
    let dataNeste: Response;
    try {
        const [forrige, neste] = await Promise.all(
            ['forrige', 'neste']
                .map(
                    async tidslinjetabell => {
                        const searchParams = [
                            `modus=panda_poliser`,
                            `sessionId=${sessionId}`,
                            `personId=${personId}`,
                            `kilde=${tidslinjetabell}`
                        ]
                        const URL = `${BASE_URL}/api/v1/hent?${searchParams.join("&")}`
                        return await fetch(URL)
                    }
                )
        )
        dataForrige = forrige
        dataNeste = neste

        console.log(dataForrige)
    } catch (error) {
        return new Response(`Feil ved henting fra api`, {
            status: 404
        })
    }
    if (dataForrige.ok) {
        const forrigeJson = await dataForrige.json()
        const nesteJson = await dataNeste.json()

        return {
            personId,
            sessionId,
            forrige: forrigeJson.data[0]['data'],
            neste: nesteJson.data[0]['data'],
        }
    }
    return null;
}

export default function PandavarehusInput() {
    const {
        table,
        oppdaterMedNyeTidslinjer,
    } = useContext(PandavarehusContext)

    const data = useLoaderData()

    const { sessionId, personId, forrige, neste } = data
    invariant(forrige, 'Mangler poliser for forrige')
    invariant(neste, 'Mangler poliser for neste')

    const tidslinjeparser = new PandavarehusPoliserParser();

    const parsetForrige: Tidslinje[] = tidslinjeparser.parse(forrige)
    const parsetNeste: Tidslinje[] = tidslinjeparser.parse(neste)

    useEffect(() => {
        oppdaterMedNyeTidslinjer(
            (table === 'forrige' ? parsetForrige : parsetNeste)
        )
    }, [])

    useEffect(() => {
        oppdaterMedNyeTidslinjer(
            (table === 'forrige' ? parsetForrige : parsetNeste)
        )
    }, [table])


    return (
        <>
            <Heading>{`Poliser`}</Heading>
            <TidslinjerView />
        </>

    );
}