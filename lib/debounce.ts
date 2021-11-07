export default function debounceFactory({wait}: {wait: number} = {wait: 50}) {
    let timeoutId: NodeJS.Timeout;
    return (func: () => void) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(func, wait);
    };
}
