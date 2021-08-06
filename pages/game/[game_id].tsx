import Head from 'next/head';
import {useRouter} from 'next/router';
import {useRecoilValue} from 'recoil';
import {gamesAtomFamily} from '../../state/game';
import useRequiresLogin from '../../state/hooks/useRequiresLogin';

function Contents({game_id}: {game_id: string}) {
    const gameInfo = useRecoilValue(gamesAtomFamily(game_id));
    console.log(gameInfo);
    return (
        <div className="flex">
            <div className="max-w-md">
                <h1 className="mb-5 text-5xl font-bold">{game_id}</h1>
                <div className="shadow stats">
                    <div className="stat">
                        <div className="stat-title">Host</div>
                        <div className="stat-value text-primary">
                            {gameInfo?.host_user_id || <pre> </pre>}
                        </div>
                    </div>
                </div>
            </div>
            <pre className="mb-5" style={{textAlign: 'left'}}>
                {JSON.stringify(gameInfo, null, '  ')}
            </pre>
        </div>
    );
}
export default function Game() {
    useRequiresLogin();
    const router = useRouter();
    const {game_id} = router.query;
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
            <div className="hero min-h-screen bg-base-200">
                {typeof game_id == 'string' ? (
                    <Contents game_id={game_id} />
                ) : (
                    <div>Game id not recognised</div>
                )}
            </div>
        </>
    );
}
