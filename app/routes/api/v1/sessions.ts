import { json, LoaderFunction } from "remix";


export const loader: LoaderFunction = async () => {
    const { pandavarehus } = await import("~/util/mongoDbClient");
    const db = await pandavarehus()

    return json(
        await db.distinct('sessionId')
    );
}
