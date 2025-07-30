

export const unikeVerdier = (liste: string[]): string[] => {
    return [...new Set(liste)].sort()
}