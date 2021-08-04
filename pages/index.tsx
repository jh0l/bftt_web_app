import Head from 'next/head';
import {useCallback, useState} from 'react';

// TODO add in error message overlay and state management
// TODO set up websockets

function HostGameModal() {
    const [name, setName] = useState('');
    const newGame = useCallback(async () => {
        if (name) {
        }
    }, [name]);
    return (
        <>
            <label
                htmlFor="my-modal-2"
                className="btn btn-primary modal-button"
            >
                Host Game
            </label>
            <input type="checkbox" id="my-modal-2" className="modal-toggle" />
            <div className="modal">
                <div className="modal-box indicator">
                    <div className="modal-box">
                        <label
                            htmlFor="my-modal-2"
                            className="indicator-item badge badge-primary btn btn-square btn-xs"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="inline-block w-4 h-4 stroke-current"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                ></path>
                            </svg>
                        </label>
                        <p>
                            Enim dolorem dolorum omnis atque necessitatibus.
                            Consequatur aut adipisci qui iusto illo eaque.
                            Consequatur repudiandae et. Nulla ea quasi eligendi.
                            Saepe velit autem minima.
                        </p>
                        <div className="modal-action justify-center">
                            <div className="form-control left">
                                <label className="label">
                                    <span className="label-text">
                                        What should it be called?
                                    </span>
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        className="w-full input input-primary input-bordered"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                    />
                                    <button
                                        className="btn btn-primary"
                                        onClick={newGame}
                                    >
                                        go
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function Home() {
    return (
        <>
            <Head>
                <title>TTT</title>
                <meta
                    name="description"
                    content="A turn based social deduction game"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="hero min-h-screen bg-base-200">
                <div className="text-center hero-content">
                    <div className="max-w-md">
                        <h1 className="mb-5 text-5xl font-bold">Hello there</h1>
                        <p className="mb-5">
                            Provident cupiditate voluptatem et in. Quaerat
                            fugiat ut assumenda excepturi exercitationem quasi.
                            In deleniti eaque aut repudiandae et a id nisi.
                        </p>
                        <HostGameModal />
                    </div>
                </div>
            </div>
        </>
    );
}
