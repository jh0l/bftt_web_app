import {useRouter} from 'next/router';
import {useEffect} from 'react';
import {useRecoilCallback, useRecoilState} from 'recoil';
import {currentGameAtom, gameListAtom, gamesAtomFamily} from '../game';
import {userAtom} from '../user';
import RelayWS from '../websockets';

interface LoginResponse {
    user_id: string;
    msg: string;
}

export async function loginApi(
    name: string,
    pw: string
): Promise<LoginResponse | Error> {
    console.log(process.env.API_ADDRESS);
    const res = await fetch(process.env.API_ADDRESS + 'login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({user_id: name, password: pw}),
        credentials: 'include',
    });
    try {
        const data = (await res.json()) as LoginResponse;
        if (res.ok) {
            return data;
        } else {
            throw data;
        }
    } catch (e) {
        return new Error(String(e));
    }
}

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
        const data = (await res.json()) as IndexResponse;
        if (res.ok) {
            return data;
        } else {
            throw data;
        }
    } catch (e) {
        return new Error(String(e));
    }
}

async function logoutApi(): Promise<string | Error> {
    if (typeof process.env.API_ADDRESS != 'string') throw Error('bad');
    const res = await fetch(process.env.API_ADDRESS + 'logout', {
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
        return new Error(String(e));
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
                    if (res.user_id != null && res.msg != null)
                        loginApi(res.user_id, res.msg).then((loginRes) => {
                            if (loginRes instanceof Error) {
                                console.log(loginRes);
                                router.push('/login');
                            } else {
                                setUser({user_id: res.user_id});
                                RelayWS.connect({
                                    user_id: res.user_id,
                                    password: res.msg,
                                });
                            }
                        });
                    else router.push('/login');
                }
            });
        }
    }, [user, router, setUser]);
}

export function useLogoutHandler() {
    const router = useRouter();
    return useRecoilCallback(({reset, snapshot}) => async () => {
        RelayWS.close();
        await logoutApi();
        const gameList = await snapshot.getPromise(gameListAtom);
        for (let id in gameList) {
            reset(gamesAtomFamily(id));
        }
        reset(gameListAtom);
        reset(currentGameAtom);
        reset(userAtom);

        router.push('/login');
    });
}
