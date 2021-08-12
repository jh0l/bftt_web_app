import Head from 'next/head';
import {useRouter} from 'next/router';
import {useEffect} from 'react';
import {useRecoilValue} from 'recoil';
import {Game as GameState, gamesAtomFamily} from '../../state/game';
import useRequiresLogin from '../../state/hooks/useLogin';
import Game from '../../components/Game';

export default function GamePage() {
    useRequiresLogin();
    const router = useRouter();
    const {game_id} = router.query;
    const game_id_str = typeof game_id == 'string' ? game_id : '';
    const gameInfo = useRecoilValue(gamesAtomFamily(game_id_str));
    console.log(gameInfo);
    useEffect(() => {
        if (!gameInfo) {
            router.push('/');
        }
    }, [gameInfo, router]);
    return <Content game_id={game_id} gameInfo={gameInfo} />;
}

export function Content({
    game_id,
    gameInfo,
}: {
    game_id: string | string[] | undefined;
    gameInfo: GameState | null;
}) {
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
            <div className="min-h-full flex flex-1 p-4 justify-center">
                {gameInfo ? (
                    <Game game={gameInfo} />
                ) : (
                    <div>{game_id} not found</div>
                )}
            </div>
        </>
    );
}
