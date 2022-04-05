import { Heading, ListItem, UnorderedList, VStack } from "@chakra-ui/react";
import { json, Link, LoaderFunction, Outlet, useLoaderData } from "remix";
import ColorProvider from "~/state/ColorProvider";
import FilterProvider from "~/state/FilterProvider";
import PandavarehusProvider from "~/state/PandavarehusProvider";
import TidslinjerProvider from "~/state/TidslinjerProvider";

export const loader: LoaderFunction = async () => {
    const { pandavarehus } = await import("~/util/mongoDbClient");
    const db = await pandavarehus()

    const sessions = await db.distinct('sessionId')
    return json({ sessions });
}

export default function Pandavarehus() {
    const { sessions } = useLoaderData();
    return (
        <TidslinjerProvider>
            <FilterProvider>
                <ColorProvider>
                    <PandavarehusProvider>
                        {
                            <VStack>
                                <Heading>Økter</Heading>
                                <UnorderedList>
                                    {
                                        sessions
                                            .sort()
                                            .map(
                                                (sessionId: string) => (
                                                    <ListItem key={sessionId} >
                                                        <Link
                                                            prefetch="intent"
                                                            to={`./${sessionId}/`}
                                                        >
                                                            {sessionId}
                                                        </Link>

                                                    </ListItem>
                                                )
                                            )
                                    }

                                </UnorderedList>
                                <Outlet />
                            </VStack>
                        }
                    </PandavarehusProvider>
                </ColorProvider>
            </FilterProvider>
        </TidslinjerProvider>
    )
}