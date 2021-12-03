import {atom, useRecoilState} from 'recoil';
import React, {ReactNode, useEffect, useState} from 'react';

export const moveTileSingleton = atom<number | null>({
    key: 'singleton',
    default: null,
});
interface SingletonProps {
    tag: number;
    unmount: () => void;
    children: ReactNode;
}
/** Ensures only the last instance of this component mounted should be mounted (assuming `unmount` works)
 */
export default function Singleton({tag, unmount, children}: SingletonProps) {
    const [sgl, setSgl] = useRecoilState(moveTileSingleton);
    const [mounted, setMounted] = useState(0);
    useEffect(() => {
        if (mounted > 0 && tag !== sgl) {
            unmount();
        }
    }, [unmount, mounted, tag, sgl]);
    useEffect(() => {
        let clear: NodeJS.Timeout | null = null;
        if (mounted < 1) {
            setSgl(tag);
            clear = setTimeout(() => setMounted((x) => x + 1), 0);
        }
        return () => {
            clear !== null && clearTimeout(clear);
        };
    }, [mounted, setSgl, tag]);
    return <>{children}</>;
}
