import Head from 'next/head';

export default function Game() {
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
                        <button className="btn btn-primary">Host Game</button>
                    </div>
                </div>
            </div>
        </>
    );
}
