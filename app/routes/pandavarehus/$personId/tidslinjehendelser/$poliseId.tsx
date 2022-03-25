import { Heading, VStack } from "@chakra-ui/react";
import React, { useContext, useEffect, useMemo } from "react";
import { Link, LoaderFunction, useLoaderData } from "remix";
import invariant from "ts-invariant";
import TidslinjehendelseController from "~/components/input/TidslinjehendelseController";
import TidslinjeSelector from "~/components/pandavarehus/TidslinjeSelector";
import TilstandSlider from "~/components/pandavarehus/TilstandSlider";
import TidslinjerView from "~/components/TidslinjeView";
import SimulerTidslinjehendelser, { PoliseSimulering } from "~/domain/SimulerTidslinjehendelser";
import Tidslinjehendelse from "~/domain/Tidslinjehendelse";
import Tidslinjehendelsediffer from "~/domain/Tidslinjehendelsediff";
import PandavarehusTidslinjehendelserParser from '~/parsers/pandavarehus/PandavarehusTidslinjehendelserParser';
import { PandavarehusContext } from '~/state/PandavarehusProvider';
import { unikeVerdier } from "~/util/utils";

export const loader: LoaderFunction = async ({ params }) => {
    const { poliseId, personId } = params
    const tidslinjehendelseHost = "http://localhost:3044"

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
                        const URL = `${tidslinjehendelseHost}/${tidslinjetabell}?PersonId=eq.${personId}&PoliseId=eq.${poliseId}&Hendelsestype=neq.KONVERTERING&not.and("Forrige verdi".is.null,"Neste verdi".is.null)`
                        return await fetch(URL)
                    }
                )
        )
        dataForrige = forrige
        dataNeste = neste

    } catch (error) {
        return new Response(`Feil ved henting fra ${tidslinjehendelseHost}, kjører pandavarehus-kanvas-connector?`, {
            status: 404
        })
    }
    if (dataForrige.ok) {
        const forrigeJson = await dataForrige.json()
        const nesteJson = await dataNeste.json()
        return {
            personId,
            poliseId,
            forrige: forrigeJson,
            neste: nesteJson,
        }
    }

    return new Response(`Noe gikk galt ved henting fra ${tidslinjehendelseHost}`, {
        status: 500
    })
}


export default function PandavarehusInput() {
    const {
        table,
        parset,
        oppdaterSimulerteSamlinger,
        setDiff,
        setPoliseIder
    } = useContext(PandavarehusContext)

    const data = useLoaderData()

    const { personId, poliseId, forrige, neste } = data
    invariant(poliseId, 'Mangler poliseId')
    invariant(forrige, 'Mangler tidslinjehendelser for forrige')
    invariant(neste, 'Mangler tidslinjehendelser for neste')

    const tidslinjeparser = new PandavarehusTidslinjehendelserParser();

    const parsetForrige: Tidslinjehendelse[] = useMemo(() => tidslinjeparser.parseAlle(forrige), [forrige])
    const parsetNeste: Tidslinjehendelse[] = useMemo(() => tidslinjeparser.parseAlle(neste), [neste])

    const simulertForrige: PoliseSimulering = useMemo(() => SimulerTidslinjehendelser.simulerPolise(parsetForrige), [parsetForrige])
    const simulertNeste: PoliseSimulering = useMemo(() => SimulerTidslinjehendelser.simulerPolise(parsetNeste), [parsetNeste])

    const poliseIder = unikeVerdier(
        [...forrige, ...neste].map(hendelse => hendelse.PoliseId)
    )
        .map(Number.parseInt)

    useEffect(() => {
        setDiff(Tidslinjehendelsediffer.utledPolise(parsetForrige, parsetNeste))
    }, [])

    useEffect(() => {
        setPoliseIder(poliseIder)
        oppdaterSimulerteSamlinger(
            (table === 'forrige' ? simulertForrige : simulertNeste).simulering
        )
    }, [table])


    return (
        <>
            <VStack>
                <Link to={`/pandavarehus/${personId}/poliser`}>Bytt til poliser</Link>
                <Heading>{`Kategoriseringer Polise ${poliseId}`}</Heading>
                <TidslinjehendelseController />
            </VStack >
            <TidslinjeSelector />
            <TilstandSlider />
            <TidslinjerView />
        </>
    );
}