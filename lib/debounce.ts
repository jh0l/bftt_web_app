// export default function debounceFactory({wait}: {wait: number} = {wait: 50}) {
//     let timeoutId: NodeJS.Timeout;
//     return (func: () => void) => {
//         clearTimeout(timeoutId);
//         timeoutId = setTimeout(func, wait);
//     };
// }

export default class Debounce {
    static singleton: Record<string, NodeJS.Timeout> = {};
    static use(key: string, callback: () => void, wait: number = 50) {
        const timeoutId = Debounce.singleton[key];
        return (func: () => void) => {
            clearTimeout(timeoutId);
            Debounce.singleton[key] = setTimeout(func, wait);
        };
    }
}
