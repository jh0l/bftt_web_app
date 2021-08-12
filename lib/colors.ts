const colors = ['red', 'yellow', 'green', 'blue', 'indigo', 'purple', 'pink'];
const grades = ['100', '300', '500', '700', '900'];

const colorList = colors.reduce(
    (acc, c) => [...acc, ...grades.map((g) => c + '-' + g)],
    [] as string[]
);

function hashCode(str: string) {
    var hash = 5,
        i,
        chr,
        len;
    if (str.length == 0) return hash;
    for (i = 0, len = str.length; i < len; i++) {
        chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

export function strColor(str: string): string {
    if (colors.indexOf(str) > -1) {
        return str + '-500';
    }
    return colorList[hashCode(str) % colorList.length];
}
