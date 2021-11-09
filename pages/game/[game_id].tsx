import Head from 'next/head';
import {useRouter} from 'next/router';
import {useRecoilValue} from 'recoil';
import {
    gamePlayerIdsAtomFamily,
    GameStats,
    gameStatsAtomFamily,
} from '../../state/game';
import useRequiresLogin from '../../state/hooks/useLogin';
import Game from '../../components/Game';

export default function GamePage() {
    useRequiresLogin();
    const router = useRouter();
    const {game_id} = router.query;
    const game_id_str = typeof game_id == 'string' ? game_id : '';
    const gameStats = useRecoilValue(gameStatsAtomFamily(game_id_str));
    if (!gameStats)
        // TODO Player must have navigated to GamePage by URL directly, load user and game
        return "We're suppose to load the game through std GET request here";

    if (typeof game_id != 'string')
        return 'invalid game ID: ' + JSON.stringify(game_id);

    return <Content game_id={game_id} />;
}

export function Content({game_id}: {game_id: string}) {
    const gameStats = useRecoilValue(gameStatsAtomFamily(game_id));
    const playerIds = useRecoilValue(gamePlayerIdsAtomFamily(game_id));
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
            {/* <div className="max-h-full flex flex-1 justify-center overflow-scroll"> */}
            {game_id && gameStats && playerIds ? (
                <Game gameStats={gameStats} playerIds={playerIds} />
            ) : (
                <div>{game_id} not found</div>
            )}
            {/* </div> */}
        </>
    );
}
