import {memo, ReactNode, useEffect, useRef} from 'react';
import {createPortal} from 'react-dom';

function Portal({children}: {children: ReactNode}) {
    /**
     * keeps ref between renders
     */
    const el = useRef<HTMLDivElement | null>(null);

    /**
     * create element if empty (for the first time render only)
     */
    if (!el.current) el.current = document.createElement('div');

    useEffect(() => {
        const mount = document.getElementById('portal-root');
        const {current} = el;
        mount?.appendChild(current as Node);
        return () => {
            mount?.removeChild(current as Node);
        };
    }, []);

    return createPortal(children, el.current);
}

export default memo(Portal);
