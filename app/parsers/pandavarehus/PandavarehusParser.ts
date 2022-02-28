import Tidslinje from "../../domain/Tidslinje";

export default interface Pandavarehusparser {
    parse(data: any[]): Tidslinje[];
}