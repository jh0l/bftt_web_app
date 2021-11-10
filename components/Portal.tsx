import {ReactNode, useEffect} from 'react';
import {createPortal} from 'react-dom';

export default function Portal({children}: {children: ReactNode}) {
    const mount = document.getElementById('portal-root');
    const el = document.createElement('div');

    useEffect(() => {
        mount?.appendChild(el);
        return () => {
            mount?.removeChild(el);
        };
    }, [el, mount]);

    return createPortal(children, el);
}
