import {ChakraProvider} from "@chakra-ui/react";
import {MetaFunction} from "@remix-run/node";
import {Links, Meta, Outlet, Scripts, ScrollRestoration,} from "@remix-run/react";

export const meta: MetaFunction = () => [
    {charSet: "utf-8"},
    {title: "kanvas"},
    {name: "viewport", content: "width=device-width,initial-scale=1"},
];

export default function App() {
    return (
        <html lang="en">
        <head>
            <Meta/>
            <Links/>
        </head>
        <body>
        <ChakraProvider>
            <Outlet/>
        </ChakraProvider>
        <ScrollRestoration/>
        <Scripts/>
        </body>
        </html>
    );
}
