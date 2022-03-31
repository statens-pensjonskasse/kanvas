import { Heading, useToast, VStack } from "@chakra-ui/react";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, LoaderFunction, useLoaderData } from "remix";
import invariant from "ts-invariant";
import TidslinjehendelseController from "~/components/input/TidslinjehendelseController";
import GjeldendeEgenskaperListe from "~/components/pandavarehus/GjeldendeEgenskaperListe";
import TidslinjeSelector from "~/components/pandavarehus/TidslinjeSelector";
import TidslinjerView from "~/components/TidslinjeView";
import GjeldendeEgenskapdiffer from "~/domain/GjeldendeEgenskapdiff";
import SimulerTidslinjehendelser, { PoliseSimulering } from "~/domain/SimulerTidslinjehendelser";
import Tidslinjehendelse from "~/domain/Tidslinjehendelse";
import Tidslinjehendelsediffer from "~/domain/Tidslinjehendelsediff";
import PandavarehusTidslinjehendelserParser from '~/parsers/pandavarehus/PandavarehusTidslinjehendelserParser';
import { PandavarehusContext } from '~/state/PandavarehusProvider';
import { unikeVerdier } from "~/util/utils";

export const loader: LoaderFunction = async ({ params }) => {
    const { poliseId, personId } = params

    if (!personId) {
        throw new Response('Mangler personId', {
            status: 400
        })
    }

    return {
        personId,
        poliseId,
    }
}

export default function PandavarehusInput() {
    const {
        table,
        oppdaterSimulerteSamlinger,
        setDiff,
        setGjeldendeEgenskaperdiffer,
        setPoliseIder
    } = useContext(PandavarehusContext)
    const [forrige, setForrige] = useState([])
    const [neste, setNeste] = useState([])

    const toast = useToast()


    const data = useLoaderData()
    const { personId, poliseId } = data
    const tidslinjehendelseHost = "http://localhost:3044"
    invariant(poliseId, 'Mangler poliseId')
    invariant(personId, 'Mangler personId')

    const tidslinjeparser = new PandavarehusTidslinjehendelserParser();

    useEffect(() => {
        const fetchData = async (tidslinjetabell: string) => {
            const kriterier = [
                `PersonId=eq.${personId}`,
                `PoliseId=eq.${poliseId}`,
                `Hendelsestype=not.eq.FREMSKRIVING`
            ]
            const URL = `${tidslinjehendelseHost}/${tidslinjetabell}?${kriterier.join("&")}`
            let data: Response;
            try {
                data = await fetch(URL)
            } catch (error) {
                toast({
                    title: `Feil ved henting fra ${tidslinjehendelseHost}`,
                    description: `${error.message}, kjører pandavarehus-kanvas-connector.sh?`,
                    position: "top-right",
                    status: "error"
                })
                return []
            }

            if (data.ok) {
                return await data.json()
            }
            else {
                toast({
                    title: `Feil ved henting fra ${tidslinjehendelseHost}`,
                    description: `${data.status}: ${data.statusText}. Husk å kjøre pandavarehus-kanvas-connector.sh på nytt om du har lastet inn nye data.`,
                    position: "top-right",
                    status: "error"
                })
            }
        }

        Promise.all([
            fetchData("forrige"),
            fetchData("neste")
        ])
            .then(([forrige, neste]) => {
                setForrige(forrige)
                setNeste(neste)
            })
    }, [personId, tidslinjehendelseHost])

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
                <Link to={`/pandavarehus/${personId}/poliser`}>Bytt til poliser</Link>
                <Heading>{`Kategoriseringer Polise ${poliseId}`}</Heading>
                <TidslinjehendelseController />
            </VStack >
            <TidslinjeSelector />
            <GjeldendeEgenskaperListe />
            <TidslinjerView />
        </>
    );
}