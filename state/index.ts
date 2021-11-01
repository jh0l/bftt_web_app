/// helper fn for splitting string by seperator once
export function splitCmd(s: string) {
    const i = s.indexOf(' ');
    if (i >= 0) {
        return [s.slice(0, i), s.slice(i + 1)];
    }
    return [s, ''];
}
