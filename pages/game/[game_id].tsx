import Head from 'next/head';
import {useRouter} from 'next/router';
import {useRecoilValue} from 'recoil';
import {Game as GameState, gamesAtomFamily} from '../../state/game';
import useRequiresLogin from '../../state/hooks/useLogin';
import Game from '../../components/Game';
import {userAtom} from '../../state/user';

export default function GamePage() {
    useRequiresLogin();
    const router = useRouter();
    const user = useRecoilValue(userAtom);
    const {game_id} = router.query;
    const game_id_str = typeof game_id == 'string' ? game_id : '';
    const gameInfo = useRecoilValue(gamesAtomFamily(game_id_str));
    if (!gameInfo) {
        // TODO Player must have navigated to GamePage by URL directly, load user and game
        return "We're suppose to load the game through std GET request here";
    }
    return (
        <Content
            game_id={game_id}
            gameInfo={gameInfo}
            userId={user?.user_id || null}
        />
    );
}

export function Content({
    game_id,
    gameInfo,
    userId,
}: {
    game_id: string | string[] | undefined;
    gameInfo: GameState | null;
    userId: string | null;
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
            {/* <div className="max-h-full flex flex-1 justify-center overflow-scroll"> */}
            {gameInfo && userId ? (
                <Game game={gameInfo} />
            ) : (
                <div>{game_id} not found</div>
            )}
            {/* </div> */}
        </>
    );
}
