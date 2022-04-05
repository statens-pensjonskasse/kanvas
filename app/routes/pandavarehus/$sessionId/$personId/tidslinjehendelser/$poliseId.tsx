import { Heading, VStack } from "@chakra-ui/react";
import React, { useContext, useEffect, useMemo } from "react";
import { LoaderFunction, useLoaderData } from "remix";
import invariant from "ts-invariant";
import TidslinjehendelseController from "~/components/input/TidslinjehendelseController";
import GjeldendeEgenskapdiffer from "~/domain/GjeldendeEgenskapdiff";
import SimulerTidslinjehendelser, { PoliseSimulering } from "~/domain/SimulerTidslinjehendelser";
import Tidslinjehendelse from "~/domain/Tidslinjehendelse";
import Tidslinjehendelsediffer from "~/domain/Tidslinjehendelsediff";
import PandavarehusTidslinjehendelserParser from '~/parsers/pandavarehus/PandavarehusTidslinjehendelserParser';
import { PandavarehusContext } from '~/state/PandavarehusProvider';
import { unikeVerdier } from "~/util/utils";

export const loader: LoaderFunction = async ({ params, request }) => {
    const { poliseId, sessionId, personId } = params
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
                            `modus=panda_tidslinjehendelser`,
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

    } catch (error) {
        return new Response(`Feil ved henting fra api ${BASE_URL}`, {
            status: 404
        })
    }
    if (dataForrige.ok) {
        const forrigeJson = await dataForrige.json()
        const nesteJson = await dataNeste.json()
        return {
            personId,
            poliseId,
            sessionId,
            forrige: forrigeJson.data.length ? forrigeJson.data[0]['data'] : [],
            neste: nesteJson.data.length ? nesteJson.data[0]['data'] : [],
        }
    }

    return new Response(`Noe gikk galt ved henting fra ${tidslinjehendelseHost}`, {
        status: 500
    })
}

export default function PandavarehusInput() {
    const {
        table,
        oppdaterSimulerteSamlinger,
        setDiff,
        setGjeldendeEgenskaperdiffer,
        setPoliseIder,
    } = useContext(PandavarehusContext)

    const data = useLoaderData()

    const { personId, sessionId, poliseId, forrige, neste } = data
    invariant(poliseId, 'Mangler poliseId')
    invariant(forrige, 'Mangler tidslinjehendelser for forrige')
    invariant(neste, 'Mangler tidslinjehendelser for neste')

    const tidslinjeparser = new PandavarehusTidslinjehendelserParser();

    const parsetForrige: Tidslinjehendelse[] = useMemo(() => tidslinjeparser.parseAlle(forrige), [forrige])
    const parsetNeste: Tidslinjehendelse[] = useMemo(() => tidslinjeparser.parseAlle(neste), [neste])

    const simulertForrige: PoliseSimulering = useMemo(() => SimulerTidslinjehendelser.simulerPolise(parsetForrige), [parsetForrige])
    const simulertNeste: PoliseSimulering = useMemo(() => SimulerTidslinjehendelser.simulerPolise(parsetNeste), [parsetNeste])

    const diff: Tidslinjehendelsediffer = useMemo(() => Tidslinjehendelsediffer.utledPolise(parsetForrige, parsetNeste), [parsetForrige, parsetNeste])

    const gjeldendeEgenskapDiffer: GjeldendeEgenskapdiffer = useMemo(() => GjeldendeEgenskapdiffer.utled(simulertForrige, simulertNeste), [simulertForrige, simulertNeste])

    const poliseIder = unikeVerdier(
        [...forrige, ...neste].map(hendelse => hendelse.PoliseId)
    )
        .map(Number.parseInt)


    useEffect(() => {
        setDiff(diff)
        setGjeldendeEgenskaperdiffer(gjeldendeEgenskapDiffer)
        setPoliseIder(poliseIder)
        oppdaterSimulerteSamlinger(
            (table === 'forrige' ? simulertForrige : simulertNeste).simulering
        )
    }, [forrige, neste, table])


    return (
        <>
            <VStack>
                <Heading>{`Tidslinjehendelser polise ${poliseId}`}</Heading>
                <TidslinjehendelseController />
            </VStack >
        </>
    );
}