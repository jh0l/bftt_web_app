import {useRouter} from 'next/router';
import {useEffect} from 'react';
import {useRecoilCallback, useRecoilState} from 'recoil';
import {useAlerts} from '../alerts';
import {
    currentGameAtom,
    gameListAtom,
    gamePlayerIdsAtomFamily,
    gameStatsAtomFamily,
} from '../game';
import {userAtom, userStatusAtom} from '../user';
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
    try {
        let res = await fetch(process.env.API_ADDRESS + 'login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({user_id: name, password: pw}),
            credentials: 'include',
        });
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
    try {
        const res = await fetch(process.env.API_ADDRESS, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            credentials: 'include',
        });
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
    try {
        const res = await fetch(process.env.API_ADDRESS + 'logout', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            credentials: 'include',
        });
        return await res.text();
    } catch (e) {
        return new Error(String(e));
    }
}

export default function useRequiresLogin() {
    const {pusher} = useAlerts();
    const [user, setUser] = useRecoilState(userAtom);
    const router = useRouter();
    useEffect(() => {
        if (user == null) {
            indexApi().then((res) => {
                if (res instanceof Error) {
                    pusher({msg: 'Failed to log in', type: 'error'});
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
    }, [user, router, setUser, pusher]);
    return user;
}

export function useLogoutHandler() {
    const router = useRouter();
    const {pusher} = useAlerts();
    return useRecoilCallback(({reset, snapshot}) => async () => {
        RelayWS.close();
        const res = await logoutApi();
        if (res instanceof Error) {
            console.log(res);
            pusher({msg: 'failed to contact logout endpoint', type: 'error'});
        }
        const release = snapshot.retain();
        const gameList = await snapshot.getPromise(gameListAtom);
        release();
        for (let id in gameList) {
            reset(gameStatsAtomFamily(id));
            reset(gamePlayerIdsAtomFamily(id));
        }
        reset(gameListAtom);
        reset(currentGameAtom);
        reset(userAtom);
        reset(userStatusAtom);

        router.push('/login');
    });
}
