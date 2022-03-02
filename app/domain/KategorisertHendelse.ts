import { Aksjonsdato } from './Aksjonsdato';
import Tidslinjehendelse from './Tidslinjehendelse';

export default interface KategorisertHendelse {
    aksjonsdato: Aksjonsdato,
    kategorisering: string,
    hendelser: Tidslinjehendelse[]
}