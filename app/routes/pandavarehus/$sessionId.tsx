import { Heading, ListItem, UnorderedList } from "@chakra-ui/react";
import { json, Link, LoaderFunction, Outlet, useLoaderData } from "remix";

export const loader: LoaderFunction = async ({ params }) => {
    const { pandavarehus } = await import("~/util/mongoDbClient");
    const db = await pandavarehus()
    const { sessionId } = params

    const people = await db.distinct(
        'personId',
        { sessionId }
    )

    return json({ people, sessionId });
}

export default function SessionIndex() {
    const { people, sessionId } = useLoaderData()

    return (
        <>
            <Heading size={'md'}>Personer</Heading>
            <UnorderedList>
                {
                    people.map(
                        (personId: string) => (
                            <ListItem key={personId} >
                                <Link
                                    prefetch="intent"
                                    to={`./${personId}/`}
                                >
                                    {personId}
                                </Link>
                            </ListItem>
                        )
                    )
                }
            </UnorderedList>
            <Outlet />
        </>
    )
}