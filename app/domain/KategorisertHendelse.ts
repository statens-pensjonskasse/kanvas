import Tidslinjehendelse from './Tidslinjehendelse'

export default interface KategorisertHendelse {
    aksjonsdato: Date,
    kategorisering: string,
    hendelser: Tidslinjehendelse[]
}