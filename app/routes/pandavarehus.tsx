import { Container, Input } from "@chakra-ui/react";
import { ActionFunction, Form, LoaderFunction, Outlet, redirect, useLoaderData } from "remix";
import ColorProvider from "~/state/ColorProvider";
import FilterProvider from "~/state/FilterProvider";
import PandavarehusProvider from "~/state/PandavarehusProvider";
import TidslinjerProvider from "~/state/TidslinjerProvider";

export const action: ActionFunction = async ({ request }) => {
    const body = await request.formData()
    const personId = body.get('personId')
    return redirect(`/pandavarehus/${personId}/poliser`)
}

export const loader: LoaderFunction = ({ params }) => {
    return {
        personId: params.personId
    }
}

export default function Pandavarehus() {
    const data = useLoaderData()
    return (
        <TidslinjerProvider>
            <FilterProvider>
                <ColorProvider>
                    <PandavarehusProvider>
                        <Container>
                            <Form
                                method="post"
                            >
                                <Input
                                    name='personId'
                                    placeholder="personId"
                                    defaultValue={data.personId}
                                >
                                </Input>
                            </Form>
                        </Container>
                        <Outlet />
                    </PandavarehusProvider>
                </ColorProvider>
            </FilterProvider>
        </TidslinjerProvider>
    )
}