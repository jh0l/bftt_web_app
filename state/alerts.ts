import {atom, useSetRecoilState} from 'recoil';
import {useCallback} from 'react';

type AlertStyle = 'info' | 'success' | 'warning' | 'error';
export type AlertType = {
    msg: string;
    timeout?: number;
    type?: AlertStyle;
};

type AlertTypeKey = AlertType & {key: number};

export const AlertState = atom({
    key: 'AlertState_v1',
    default: [] as AlertTypeKey[],
});

export const useAlerts = () => {
    const setter = useSetRecoilState(AlertState);
    return {
        closer: useCallback(
            (key: number) => setter((s) => [...s].filter((v) => v.key !== key)),
            [setter]
        ),
        pusher: useCallback(
            (notif: AlertType) =>
                setter((s) => [...s, {...notif, key: Math.random()}]),
            [setter]
        ),
    };
};
