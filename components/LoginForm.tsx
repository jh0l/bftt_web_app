import {useRouter} from 'next/router';
import {useCallback, useEffect, useState} from 'react';
import {useRecoilState} from 'recoil';
import {strColor} from '../lib/colors';
import {useAlerts} from '../state/alerts';
import {userAtom} from '../state/user';
import RelayWS from '../state/websockets';

interface LoginResponse {
    user_id: string;
    msg: string;
}

async function loginApi(
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
        return (await res.json()) as LoginResponse;
    } catch (e) {
        return new Error(e);
    }
}

export default function LoginForm() {
    const [user, setUser] = useRecoilState(userAtom);
    const [password, setPW] = useState('');
    const [name, setName] = useState('');
    const router = useRouter();
    const {pusher} = useAlerts();
    useEffect(() => {
        if (user) {
            router.push('/');
        }
    });
    const login = useCallback(async () => {
        const res = await loginApi(name, password);
        if (res instanceof Error) {
            console.log(res);
        } else {
            const {user_id, msg} = res;
            pusher({msg, type: 'success'});
            RelayWS.connect({user_id, password});
            setUser({user_id});
            router.push('/');
        }
    }, [password, name, setUser, router, pusher]);
    return (
        <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
            <div className="card-body">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">
                            Username <i>(determines colour)</i>
                        </span>
                    </label>
                    <input
                        type="text"
                        placeholder="username"
                        className={
                            'input input-bordered text-black bg-' +
                            (name ? strColor(name) : 'base-100')
                        }
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Password</span>
                    </label>
                    <input
                        type="text"
                        placeholder="password"
                        className="input input-bordered"
                        value={password}
                        onChange={(e) => setPW(e.target.value)}
                    />
                    <label className="label">
                        <a href="#" className="label-text-alt">
                            Forgot password?
                        </a>
                    </label>
                </div>
                <div className="form-control mt-6">
                    <input
                        onClick={login}
                        type="button"
                        value="Login"
                        className="btn btn-primary"
                    />
                </div>
            </div>
        </div>
    );
}
