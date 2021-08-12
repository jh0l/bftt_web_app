import {useEffect, useRef} from 'react';
import {useRecoilValue} from 'recoil';
import {AlertType, AlertState, useAlerts} from '../state/alerts';
import Info from './svg/Info';
import X from './svg/X';

function Popup({
    k,
    data: {msg, timeout, type},
    onClose,
}: {
    k: number;
    data: AlertType;
    onClose: (index: number) => void;
}) {
    const time = useRef(timeout || 2000);
    const style = type || 'info';
    useEffect(() => {
        const id = setTimeout(onClose, time.current, k);
        return () => clearTimeout(id);
    }, [onClose, time, k]);

    return (
        <div className={`pointer-events-auto indicator alert alert-${style}`}>
            <button
                onClick={() => onClose(k)}
                className={`btn btn-square btn-xs indicator-item badge badge-${style}`}
            >
                <X />
            </button>
            <div className="flex-1">
                <Info />
                <label className="mr-3">{msg}</label>
            </div>
        </div>
    );
}

export default function Alerts() {
    const alerts = useRecoilValue(AlertState);
    const {closer} = useAlerts();
    return (
        <>
            {alerts.length > 0 && (
                <div className="absolute w-screen h-screen top-0 pointer-events-none flex justify-start items-end flex-col gap-y-5 p-5 pt-16">
                    {alerts.map((n) => (
                        <Popup
                            key={n.key}
                            k={n.key}
                            data={n}
                            onClose={closer}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
