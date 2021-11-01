import {useRouter} from 'next/router';
import {useState} from 'react';
import {useRecoilValue, useResetRecoilState} from 'recoil';
import {useLogoutHandler} from '../state/hooks/useLogin';
import {userAtom} from '../state/user';

function Search() {
    const [active, setActive] = useState(false);
    return (
        <>
            <div className="w-full lg:flex max-w-lg mx-auto">
                <div className="flex-1 form-control has-popover w-full lg:w-1/2 relative">
                    <input
                        type="text"
                        placeholder="Search"
                        className="input input-ghost w-full"
                        onFocus={() => setActive(true)}
                        onBlur={() => setActive(false)}
                    />
                    <span
                        className={
                            'popover rounded shadow-lg p-1 p-1 bg-gray-100 text-red-500 mt-1 top-10 border w-full min-w-min ' +
                            (active ? 'active' : '')
                        }
                    >
                        <div className="w-60 sm:w-max">
                            search results go here
                        </div>
                    </span>
                </div>
                <button className="btn btn-square btn-ghost mx-px">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="inline-block w-6 h-6 stroke-current"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        ></path>
                    </svg>
                </button>
            </div>
        </>
    );
}

function LogoutButton() {
    const logout = useLogoutHandler();
    return (
        <li>
            <a onClick={() => logout()}>logout</a>
        </li>
    );
}

export default function Navbar() {
    const user = useRecoilValue(userAtom);
    if (!user) return null;
    return (
        <div className="navbar min-h-8 h-8 shadow-lg bg-neutral text-neutral-content">
            <div className="px-2 mx-2 sm:inline-block md:flex-none">
                <div className="dropdown">
                    <div tabIndex={0} className="m-1 link font-bold text-lg">
                        {user.user_id || <pre> </pre>}
                    </div>
                    <ul
                        tabIndex={0}
                        className="p-2 shadow menu dropdown-content bg-base-100 rounded-box w-52"
                    >
                        <LogoutButton />
                    </ul>
                </div>
            </div>
            {/* <Search /> */}
            {/* <div className="w-full lg:flex max-w-lg mx-auto" /> */}
            <div className="flex-none mx-px">
                {/* <button className="btn btn-square btn-ghost">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="inline-block w-6 h-6 stroke-current"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        ></path>
                    </svg>
                </button> */}
            </div>
        </div>
    );
}
function BurgerMenu() {
    return (
        <div className="flex-none lg:flex">
            <button className="btn btn-square btn-ghost mx-px">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="inline-block w-6 h-6 stroke-current"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                    ></path>
                </svg>
            </button>
        </div>
    );
}
