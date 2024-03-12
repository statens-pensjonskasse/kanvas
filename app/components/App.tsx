import { ChakraProvider, Container, Heading, HStack, Link, VStack } from '@chakra-ui/react';
import ColorProvider from '../state/ColorProvider';
import FilterProvider from '../state/FilterProvider';
import InputTextProvider from '../state/InputTextProvider';
import TidslinjerProvider from '../state/TidslinjerProvider';
import InputComponent from './InputComponent';
import TidslinjerView from './TidslinjeView';


function App() {

  return (
    <ChakraProvider>
      <VStack spacing={'2em'} width={'98vw'} padding={'25'}>
        <Heading size='lg' marginTop='5'>
          kanvas <span role="img" aria-label="paint brush">🖌️</span>
        </Heading>

        <ColorProvider>
          <FilterProvider>
            <TidslinjerProvider>
              <InputTextProvider>
                <TidslinjerView />

                <InputComponent />
              </InputTextProvider>

            </TidslinjerProvider>
          </FilterProvider>
        </ColorProvider>

        <footer>
          <HStack margin={'5'}>
            <Container>
              <Link
                isExternal
                href="https://git.spk.no/projects/INC/repos/kanvas/browse"
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
