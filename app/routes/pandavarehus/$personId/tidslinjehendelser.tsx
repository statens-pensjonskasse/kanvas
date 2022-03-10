import React, { useContext } from "react";
import { Link, LoaderFunction, Outlet, useLoaderData } from "remix";
import { PandavarehusContext } from "~/state/PandavarehusProvider";


export const loader: LoaderFunction = ({ params }) => {
    return {
        personId: params.personId
    }
}

export default function Tidslinjehendelser() {
    const data = useLoaderData()
    const personId = data.personId
    const { poliseIder } = useContext(PandavarehusContext)

    return (
        <>
            {poliseIder.map(
                poliseId => <Link key={poliseId} to={`/pandavarehus/${personId}/tidslinjehendelser/${poliseId}`}></Link>
            )}

            <Outlet />
        </>
    )
}