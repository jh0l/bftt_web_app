import {useEffect} from 'react';
import {useRecoilValue} from 'recoil';
import {AlertType, AlertState, useAlerts} from '../state/alerts';
import Info from './svg/Info';
import X from './svg/X';

function Popup({
    data: {msg, timeout, type},
    onClose,
}: {
    data: AlertType;
    onClose: () => void;
}) {
    const style = type || 'info';
    useEffect(() => {
        if (!timeout) return;
        const id = setTimeout(() => {});
        return () => clearTimeout(id);
    }, [onClose, timeout]);

    return (
        <div className={`pointer-events-auto indicator alert alert-${style}`}>
            <button
                onClick={onClose}
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
    console.log(alerts);
    const {closer} = useAlerts();
    return (
        <>
            {alerts.length > 0 && (
                <div className="absolute w-screen h-screen top-0 pointer-events-none flex justify-end items-start p-5">
                    {alerts.map((n, i) => (
                        <Popup key={n.key} data={n} onClose={() => closer(i)} />
                    ))}
                </div>
            )}
        </>
    );
}
