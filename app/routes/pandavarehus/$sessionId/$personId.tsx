import { Button, HStack } from "@chakra-ui/react";
import { json, Link, LoaderFunction, Outlet, useLoaderData } from "remix";

export const loader: LoaderFunction = async ({ params }) => {
    const { sessionId, personId } = params

    const { pandavarehus } = await import("~/util/mongoDbClient");
    const db = await pandavarehus()
    const moduser = await db.distinct(
        'modus',
        { sessionId, personId }
    )

    return json({ moduser });
}

export default function PersonIndex() {
    const { moduser } = useLoaderData()
    return (
        <>
            <HStack>
                {
                    moduser
                        .map(modus => modus.replace(/^panda_/, ""))
                        .map(
                            (modus: string) => (
                                <Link prefetch="intent" key={modus} to={`./${modus}/`}>
                                    <Button>
                                        {modus}
                                    </Button>
                                </Link>
                            )
                        )
                }
            </HStack>
            <Outlet />
        </>
    )
}