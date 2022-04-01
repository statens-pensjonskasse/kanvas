import { Heading, useToast } from "@chakra-ui/react";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LoaderFunction, useLoaderData } from "remix";
import TidslinjeSelector from "~/components/pandavarehus/TidslinjeSelector";
import TidslinjerView from "~/components/TidslinjeView";
import Tidslinje from "~/domain/Tidslinje";
import PandavarehusPoliserParser from "~/parsers/pandavarehus/PandavarehusPoliserParser";
import { PandavarehusContext } from '~/state/PandavarehusProvider';

export const loader: LoaderFunction = async ({ params }) => {
    const { personId } = params

    if (!personId) {
        return new Response('Mangler personId', {
            status: 400
        })
    }
    return {
        personId,
    }
}


export default function PandavarehusInput() {
    const {
        table,
        setPoliseIder,
        oppdaterMedNyeTidslinjer,
    } = useContext(PandavarehusContext)
    const [forrige, setForrige] = useState([])
    const [neste, setNeste] = useState([])

    const toast = useToast()
    const data = useLoaderData()

    const { personId } = data
    const poliserHost = "http://localhost:3033"

    const tidslinjeparser = new PandavarehusPoliserParser();

    useEffect(() => {
        const fetchData = async (tidslinjetabell: string) => {
            const kriterier = [
                `PersonId=eq.${personId}`,
            ]
            const URL = `${poliserHost}/${tidslinjetabell}?${kriterier.join("&")}`
            let data: Response;
            try {
                data = await fetch(URL)
            } catch (error) {
                toast({
                    title: `Feil ved henting fra ${poliserHost}`,
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
                    title: `Feil ved henting fra ${poliserHost}`,
                    description: `${data.status}: ${data.statusText}. Husk å kjøre pandavarehus-kanvas-connector.sh på nytt om du har lastet inn nye data.`,
                    position: "top-right",
                    status: "error"
                })
                return []
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
    }, [personId, poliserHost])

    const parsetForrige: Tidslinje[] = useMemo(() => tidslinjeparser.parse(forrige), [forrige])
    const parsetNeste: Tidslinje[] = useMemo(() => tidslinjeparser.parse(neste), [neste])

    useEffect(() => {
        oppdaterMedNyeTidslinjer(
            (table === 'forrige' ? parsetForrige : parsetNeste)
        )
        oppdaterMedNyeTidslinjer(
            (table === 'forrige' ? parsetForrige : parsetNeste)
        )
    }, [forrige, neste])

    return (
        <>
            <Link to={`/pandavarehus/${personId}/tidslinjehendelser/1`}>Bytt til tidslinjehendelser</Link>
            <Heading>{`Poliser`}</Heading>
            <TidslinjeSelector />
            <TidslinjerView />
        </>

    );
}