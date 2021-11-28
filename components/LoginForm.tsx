import {useRouter} from 'next/router';
import {useCallback, useEffect, useState} from 'react';
import {useRecoilState} from 'recoil';
import {strColor} from '../lib/colors';
import {useAlerts} from '../state/alerts';
import {loginApi} from '../state/hooks/useLogin';
import {userAtom} from '../state/user';
import RelayWS from '../state/websockets';

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
        RelayWS.connect({user_id: name, password});
        if (res instanceof Error) {
            console.log(res);
        } else {
            const {user_id, msg} = res;
            pusher({msg, type: 'success'});
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
                        id="username"
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
                        id="password"
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
                        id="login"
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
