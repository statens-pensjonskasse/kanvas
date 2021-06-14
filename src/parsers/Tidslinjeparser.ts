import Tidslinje from "../domain/Tidslinje";

export default interface Tidslinjeparser {
    parse(rawData: string[]): Tidslinje[];

    kanOversettes(rad: string[]): boolean;
}