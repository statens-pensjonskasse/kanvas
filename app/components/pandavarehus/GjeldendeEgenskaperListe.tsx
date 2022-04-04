import { Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { useContext } from "react";
import { PandavarehusContext } from "~/state/PandavarehusProvider";


export default function GjeldendeEgenskaperListe() {
    const { gjeldendeEgenskaper } = useContext(PandavarehusContext)
    const { egenskaper } = gjeldendeEgenskaper

    return (
        <>
            <TableContainer border={'2px'} borderColor={'blackAlpha.200'} shadow={'xl'} padding={'3em'} rounded={'xl'}>
                <Table size='sm'>
                    <Thead>
                        <Tr>
                            <Th>Egenskap</Th>
                            <Th>Verdi</Th>
                            <Th>Kilde</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {
                            [...egenskaper.keys()]
                                .flatMap(
                                    tidslinje => egenskaper.get(tidslinje)
                                        .flatMap(x => x)
                                        .filter(egenskap => !!egenskap.type && !!egenskap.verdi)
                                        .map(
                                            egenskap => ({
                                                egenskap,
                                                tidslinje
                                            })
                                        )
                                )
                                .sort((a, b) => a.egenskap.type < b.egenskap.type ? -1 : 1)
                                .map(
                                    ({ egenskap, tidslinje }) => (
                                        <Tr>
                                            <Td>{egenskap.type}</Td>
                                            <Td>{egenskap.verdi}</Td>
                                            <Td>{tidslinje}</Td>
                                        </Tr>
                                    )
                                )
                        }
                    </Tbody>
                </Table>
            </TableContainer>
        </>
    );
}