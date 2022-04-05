import { json, LoaderFunction } from "remix";
import invariant from "ts-invariant";

export const loader: LoaderFunction = async ({ request }) => {
    const { searchParams } = new URL(request.url);
    const { pandavarehus } = await import("~/util/mongoDbClient");
    const db = await pandavarehus()

    const sessionId = searchParams.get("sessionId")
    invariant(sessionId, "parameteren 'sessionId' er påkrevd for å hente ut data")

    const query = {}
    const foo = [...searchParams.keys()].forEach(
        key => query[key] = searchParams.get(key)
    )

    return json(
        {
            query,
            data: await db.find(query).toArray()
        }
    );
}
