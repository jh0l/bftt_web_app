import {useRouter} from 'next/router';
import {useEffect, useState} from 'react';
import {useRecoilCallback, useRecoilState, useRecoilValue} from 'recoil';
import {userAtom} from '../user';
import RelayWS from '../websockets';

interface IndexResponse {
    user_id: string;
    msg: string;
}

async function indexApi(): Promise<IndexResponse | Error> {
    if (typeof process.env.API_ADDRESS != 'string') throw Error('bad');
    const res = await fetch(process.env.API_ADDRESS, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        credentials: 'include',
    });
    try {
        return await res.json();
    } catch (e) {
        return new Error(e);
    }
}

export default function useRequiresLogin() {
    const [user, setUser] = useRecoilState(userAtom);
    const router = useRouter();
    useEffect(() => {
        if (user == null) {
            indexApi().then((res) => {
                if (res instanceof Error) {
                    console.log(res);
                } else {
                    console.log(res);
                    if (res.user_id && user == null) {
                        setUser({user_id: res.user_id});
                        RelayWS.connect({
                            user_id: res.user_id,
                            password: res.msg,
                        });
                    } else {
                        router.push('/login');
                    }
                }
            });
        }
    }, [user, router, setUser]);
}

export function useLogoutHandler() {
    const router = useRouter();
    return useRecoilCallback(({reset}) => () => {
        RelayWS.ws?.close();
        reset(userAtom);
        router.push('/login');
    });
}
