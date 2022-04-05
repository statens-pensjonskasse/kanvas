import { nanoid } from 'nanoid';
import { ActionFunction } from "remix";
import invariant from 'ts-invariant';

export const action: ActionFunction = async ({ request }) => {
    const body = await request.json()
    const data = body.data

    const modus = body.modus
    const kilde = body.kilde
    const personId = body.personId
    const sessionId = body.sessionId || nanoid()

    invariant(modus, "Forventet felt 'modus' med modusen som er kjørt")
    invariant(["forrige", "neste"].includes(kilde), "Forventet felt 'kilde' med kilden til dataene (forrige/neste)")
    invariant(personId, "Forventet felt 'personId' med personId på personen som lastes inn")
    invariant(data, "Forventer felt 'data' med dataene som skal lastes inn (JSON-format)")

    const { pandavarehus } = await import("~/util/mongoDbClient");
    const db = await pandavarehus()
    const documentId = `${sessionId}_${personId}_${modus}_${kilde}`

    await db.replaceOne(
        ({ documentId }), // skriver over dokumentet dersom documentId finnes
        ({
            ...body,
            sessionId,
            documentId
        }),
        { upsert: true }
    )

    const info = `Hent all data for session ${sessionId} med /api/v1/hent?sessionId=${sessionId}`

    return new Response(
        JSON.stringify(
            {
                sessionId,
                documentId,
                info
            }
        ),
        { status: 200 }
    )

}