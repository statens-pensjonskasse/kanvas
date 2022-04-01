import { TimeIcon } from "@chakra-ui/icons";
import { Tag, TagLabel, TagLeftIcon, Tooltip } from "@chakra-ui/react";
import { Aksjonsdato } from "~/domain/Aksjonsdato";

interface Props {
    aksjonsdato: Aksjonsdato
}

export function AksjonsdatoTag({ aksjonsdato }: Props) {
    return (
        <Tooltip label={`Aksjonsdato ${aksjonsdato.aksjonsdato}`}>
            <Tag colorScheme={'orange'}>
                <TagLeftIcon boxSize='12px' as={TimeIcon} />
                <TagLabel> {aksjonsdato.aksjonsdato}</TagLabel>
            </Tag>
        </Tooltip>
    )
}