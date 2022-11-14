import { Button, HStack, Input, Textarea, VStack } from "@chakra-ui/react";
import { useContext, useState } from "react";
import { TidslinjeContext } from "~/state/TidslinjerProvider";

export function MedlemsdataView() {
    const { tidslinjer } = useContext(TidslinjeContext)
    const defaultPersonId = "Kjersti Kvakk"
    const [personId, setPersonId] = useState(defaultPersonId)
    const [beskrivelse, setBeskrivelse] = useState("")

    return <VStack>
        <HStack>

            <VStack>

                <Input
                    placeholder={`PersonId`}
                    defaultValue={personId}
                    width={'15em'}
                    onChange={
                        (t) => {
                            setPersonId(t.target.value)
                            t.preventDefault()
                        }
                    } />
                <Input
                    placeholder={`Beskrivelse av ${personId}`}
                    width={'15em'}
                    onChange={
                        (t) => {
                            setBeskrivelse(t.target.value)
                            t.preventDefault()
                        }
                    } />
            </VStack>
            <Button
                colorScheme={'green'}
                disabled
            >
                Lagre
            </Button>
        </HStack>
        <Textarea
            readOnly
            defaultValue={
                tidslinjer
                    .map(t => t.somMedlemsdata(personId || defaultPersonId))
                    .flatMap(r => r.join("\n"))
                    .join("\n")
            }
            resize={'both'}
            wrap='off'
            fontFamily={'mono'}
            minH={'50em'}
        />
    </VStack>
}