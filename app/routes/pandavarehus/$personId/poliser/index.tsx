import { Heading } from "@chakra-ui/react";
import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { LoaderFunction, useLoaderData } from "remix";
import invariant from "ts-invariant";
import TidslinjeSelector from "~/components/pandavarehus/TidslinjeSelector";
import TidslinjerView from "~/components/TidslinjeView";
import Tidslinje from "~/domain/Tidslinje";
import PandavarehusPoliserParser from "~/parsers/pandavarehus/PandavarehusPoliserParser";
import { PandavarehusContext } from '~/state/PandavarehusProvider';

export const loader: LoaderFunction = async ({ params }) => {
    const { personId } = params
    const poliserHost = "http://localhost:3033"

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
                        const URL = `${poliserHost}/${tidslinjetabell}?PersonId=eq.${personId}`
                        return await fetch(URL)
                    }
                )
        )
        dataForrige = forrige
        dataNeste = neste

    } catch (error) {
        return new Response(`Feil ved henting fra ${poliserHost}, kjører pandavarehus-kanvas-connector?`, {
            status: 404
        })
    }
    if (dataForrige.ok) {
        const forrigeJson = await dataForrige.json()
        const nesteJson = await dataNeste.json()
        return {
            personId,
            forrige: forrigeJson,
            neste: nesteJson,
        }
    }
}


export default function PandavarehusInput() {
    const {
        table,
        setPoliseIder,
        oppdaterMedNyeTidslinjer,
    } = useContext(PandavarehusContext)

    const data = useLoaderData()

    const { personId, forrige, neste } = data
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
            <Link to={`/pandavarehus/${personId}/tidslinjehendelser/1`}>Bytt til tidslinjehendelser</Link>
            <Heading>{`Poliser`}</Heading>
            <TidslinjeSelector />
            <TidslinjerView />
        </>

    );
}