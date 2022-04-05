import { VStack } from "@chakra-ui/react";
import { json, Link, LoaderFunction, Outlet, useLoaderData } from "remix";
import { unikeVerdier } from "~/util/utils";


export const loader: LoaderFunction = async ({ params }) => {
    const { sessionId, personId } = params
    const { pandavarehus } = await import('~/util/mongoDbClient')
    const db = await pandavarehus()

    const hendelser = await db.find(
        { sessionId, personId, modus: "panda_tidslinjehendelser" },
    ).toArray()

    const poliseIder = unikeVerdier(
        hendelser
            .flatMap(hendelse => hendelse.data)
            .map(hendelse => hendelse.PoliseId)
    )

    return json({ poliseIder });
}

export default function TidslinjehendelserIndex() {
    const { poliseIder } = useLoaderData()

    return (
        <>
            <VStack>
                {
                    poliseIder
                        .map(
                            (poliseId: string) => (
                                <Link key={poliseId} to={`./${poliseId}`}>{`Tidslinjehendelser for polise ${poliseId}`}</Link>
                            )
                        )
                }
            </VStack>
            <Outlet />
        </>
    )
}