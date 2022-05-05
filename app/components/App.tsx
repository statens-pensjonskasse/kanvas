import { ChakraProvider, Container, Heading, HStack, Link, VStack } from '@chakra-ui/react';
import React from "react";
import ColorProvider from '../state/ColorProvider';
import FilterProvider from '../state/FilterProvider';
import InputTextProvider from '../state/InputTextProvider';
import PandavarehusProvider from '../state/PandavarehusProvider';
import TidslinjerProvider from '../state/TidslinjerProvider';
import InputComponent from './InputComponent';
import ParserSelector from './ParserSelector';
import TidslinjehendelseView from './TidslinjehendelseView';
import TidslinjerView from './TidslinjeView';


function App() {

  return (
    <ChakraProvider>
      <VStack spacing={'2em'} width={'100vw'} padding={'25'}>
        <Heading size='lg' marginTop='5'>
          kanvas <span role="img" aria-label="paint brush">🖌️</span>
        </Heading>

        <ColorProvider>
          <FilterProvider>
            <TidslinjerProvider>
              <PandavarehusProvider>
                <InputTextProvider>
                  <ParserSelector />

                  <TidslinjehendelseView />
                  <TidslinjerView />

                  <InputComponent />
                </InputTextProvider>

              </PandavarehusProvider>
            </TidslinjerProvider>
          </FilterProvider>
        </ColorProvider>

        <footer>
          <HStack margin={'5'}>
            <Container>
              <Link
                isExternal
                href="mailto:jarle.mathiesen@spk.no?subject=kanvas"
              >
                tilbakemelding/forslag
              </Link>
            </Container>
            <Container>
              <Link
                isExternal
                href="http://git.spk.no/projects/INC/repos/kanvas/browse"
              >
                kildekode
              </Link>
            </Container>
          </HStack>
        </footer>
      </VStack>
    </ChakraProvider>
  );

}


export default App;
