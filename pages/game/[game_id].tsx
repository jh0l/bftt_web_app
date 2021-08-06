import Head from 'next/head';
import {useRouter} from 'next/router';
import {useRecoilValue} from 'recoil';
import {Game as GameState, gamesAtomFamily} from '../../state/game';
import useRequiresLogin from '../../state/hooks/useRequiresLogin';

function Contents({game}: {game: GameState}) {
    console.log(game);
    return (
        <div className="w-full max-w-xs mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="m-5 text-5xl font-bold">{game.game_id}</h1>
                <div className="shadow stats">
                    <div className="stat">
                        <div className="stat-title">Host</div>
                        <div className="stat-value text-primary">
                            {game.host_user_id || <pre> </pre>}
                        </div>
                    </div>
                </div>
                {Object.entries(game.players)
                    .filter(([k]) => k != game.host_user_id)
                    .map(([id]) => (
                        <div className="shadow stats" key={id}>
                            <div className="stat">
                                <div className="stat-value text-secondary">
                                    {id || <pre> </pre>}
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
            <pre className="mb-5" style={{textAlign: 'left'}}>
                {/* {JSON.stringify(game, null, '  ')} */}
            </pre>
        </div>
    );
}

export default function Game() {
    useRequiresLogin();
    const router = useRouter();
    const {game_id} = router.query;
    const game_id_str = typeof game_id == 'string' ? game_id : '';
    const gameInfo = useRecoilValue(gamesAtomFamily(game_id_str));
    return (
        <>
            <Head>
                <title>BFTT: {game_id || ''}</title>
                <meta
                    name="description"
                    content="A turn based social deduction game"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="hero min-h-screen bg-base-200 flex p-4 m-auto">
                {gameInfo ? (
                    <Contents game={gameInfo} />
                ) : (
                    <div>Game id not recognised</div>
                )}
            </div>
        </>
    );
}
