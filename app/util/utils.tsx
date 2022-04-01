

export const unikeVerdier = (liste: string[]): string[] => {
    return [...new Set(liste)].sort()
}

export const stringToColor = (tekst: string) => {
    var hash = 0;
    for (var i = 0; i < tekst.length; i++) {
        hash = tekst.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substring(-2);
    }
    return colour;
}