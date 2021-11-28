import {gamePlayersAtomFamily, GameStats} from '../state/game';
import {strColor} from '../lib/colors';
import {useRecoilValue} from 'recoil';
import {userAtom, userStatusAtom} from '../state/user';
import RelayWS from '../state/websockets';
import Link from 'next/link';
import {GameConfiguration} from './GameConfiguration';
import Scrollbars from 'react-custom-scrollbars';

export function GameSettings({gameStats}: {gameStats: GameStats}) {
    const user = useRecoilValue(userAtom);
    const userStatus = useRecoilValue(userStatusAtom);
    const startGame = () => {
        RelayWS.sendStartGame(gameStats.game_id);
    };
    const isHost = gameStats.host_user_id === user?.user_id;
    if (!user || !gameStats) return null;
    return (
        <>
            <h2 className="xl">{gameStats.phase}</h2>
            {gameStats.phase == 'Init' && (
                <>
                    <GameConfiguration gameStats={gameStats} user={user} />

                    <div className="divider"></div>
                    <button
                        disabled={!isHost}
                        className="btn btn-block btn-primary"
                        onClick={startGame}
                    >
                        Start Game
                    </button>
                </>
            )}
            {gameStats.phase == 'InProg' && (
                <h1 className="m-5 text-3xl font-bold">
                    {'<Clock />'}-{gameStats.config.turn_time_secs}-
                    {gameStats.turn_end_unix}
                </h1>
            )}
            {gameStats.phase === 'End' && userStatus?.game_id === null && (
                <>
                    <div className="divider"></div>
                    <Link passHref href="/">
                        <button className="btn btn-block btn-primary">
                            Leave
                        </button>
                    </Link>
                </>
            )}
        </>
    );
}

// TODO make player list scrollable https://malte-wessel.com/react-custom-scrollbars/
export default function GameSidebar({
    gameStats,
    playerIds,
}: {
    gameStats: GameStats;
    playerIds: string[];
}) {
    const user_id = useRecoilValue(userAtom)?.user_id;
    if (!user_id) return null;
    return (
        <Scrollbars style={{width: '320px', height: '100%'}} autoHide>
            <div className="flex flex-col gap-2 ml-3 w-72">
                <h1 className="m-5 text-4xl font-bold">{gameStats.game_id}</h1>
                <GameSettings gameStats={gameStats} />
                <div className="divider">{playerIds.length} Players</div>
                <div className="flex flex-col gap-2 w-72 max-h-full overflow-x-visible no-scrollbar">
                    <PlayerListItem
                        playerId={user_id}
                        gameStats={gameStats}
                        showPoints
                        isHost={gameStats.host_user_id == user_id}
                    />
                    <div className="divider"></div>
                    {user_id !== gameStats.host_user_id && (
                        <PlayerListItem
                            playerId={gameStats.host_user_id}
                            gameStats={gameStats}
                            isHost
                        />
                    )}
                    {playerIds
                        .filter(
                            (k) => k !== gameStats.host_user_id && k !== user_id
                        )
                        .map((id) => (
                            <PlayerListItem
                                playerId={id}
                                key={id}
                                gameStats={gameStats}
                            />
                        ))}
                </div>
            </div>
        </Scrollbars>
    );
}

function PlayerListItem({
    playerId,
    gameStats,
    isHost = false,
    showPoints,
}: {
    playerId: string;
    gameStats: GameStats;
    isHost?: boolean;
    showPoints?: boolean;
}): JSX.Element {
    const userId = useRecoilValue(userAtom);
    const player = useRecoilValue(
        gamePlayersAtomFamily({user_id: playerId, game_id: gameStats.game_id})
    );
    return (
        <div className="shadow">
            <div className={'indicator relative stat bg-' + strColor(playerId)}>
                {isHost && <div className="stat-title text-black">Host</div>}
                {playerId === userId?.user_id && (
                    <div
                        className="badge badge-primary absolute"
                        style={{top: -8, left: -10}}
                    >
                        💻
                    </div>
                )}
                <div className="text-black font-bold">
                    {playerId || <pre></pre>}
                </div>
                <div className="stat-desc opacity-100 text-black flex flex-row gap-1 w-30">
                    <span className="px-1 bg-gray-200 bg-opacity-50 rounded-md font-bold">
                        <img
                            className="inline pr-1"
                            alt="Health Token"
                            src="/Heart.png"
                        ></img>
                        {player?.lives}
                    </span>
                    <span className="px-1 bg-gray-200 bg-opacity-50 rounded-md font-bold">
                        <img
                            className="inline pr-1 pb-0.5"
                            alt="player range"
                            src="/Range.png"
                        ></img>
                        {player?.range}
                    </span>
                    {showPoints && (
                        <span className="px-1 btn-primary rounded-md font-bold">
                            <img
                                className="inline pr-1 pb-0.5"
                                alt="player range"
                                src="/ActionToken.png"
                            ></img>
                            {player?.action_points ||
                                gameStats.config.init_action_points}
                        </span>
                    )}
                </div>
                <div className="stat-figure text-neutral">• • •</div>
            </div>
        </div>
    );
}
