import { ChakraProvider } from "@chakra-ui/react";
import {
  Links,
  LiveReload,
  Meta, MetaFunction, Outlet,
  Scripts,
  ScrollRestoration
} from "remix";

export const meta: MetaFunction = () => {
  return { title: "kanvas" };
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ChakraProvider>
          <Outlet />
        </ChakraProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
