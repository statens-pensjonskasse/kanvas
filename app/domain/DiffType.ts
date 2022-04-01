
export enum DiffType {
    NY = "Ny",
    ENDRET = "Endret",
    FJERNET = "Fjernet"
}

export const bestemFarge = (diffType: DiffType) => {
    switch (diffType) {
        case DiffType.NY:
            return "green"
        case DiffType.ENDRET:
            return "blue"
        case DiffType.FJERNET:
            return "red"
        default:
            return "purple";
    }
}