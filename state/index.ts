/// helper fn for splitting string by seperator once
export function splitCmd(s: string) {
    const i = s.indexOf(' ');
    return [s.slice(0, i), s.slice(i + 1)];
}
