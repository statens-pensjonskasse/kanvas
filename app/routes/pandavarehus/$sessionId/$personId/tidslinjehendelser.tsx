import React, { useContext } from "react";
import { Link, LoaderFunction, Outlet, useLoaderData } from "remix";
import { PandavarehusContext } from "~/state/PandavarehusProvider";


export const loader: LoaderFunction = ({ params }) => {
    return {
        sessionId: params.sessionId,
        personId: params.personId
    }
}

export default function Tidslinjehendelser() {
    const data = useLoaderData()
    const { personId, sessionId } = data
    const { poliseIder } = useContext(PandavarehusContext)

    return (
        <>
            {
                poliseIder.map(
                    poliseId => <Link prefetch="render" key={poliseId} to={`/pandavarehus/${sessionId}/${personId}/tidslinjehendelser/${poliseId}`}></Link>
                )
            }

            <Outlet />
        </>
    )
}