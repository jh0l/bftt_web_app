import Settings from './svg/Settings';
import {gamePlayersAtomFamily, GameStats} from '../state/game';
import {strColor} from '../lib/colors';
import {useRecoilValue} from 'recoil';
import {userAtom} from '../state/user';
import RelayWS from '../state/websockets';

export function GameSettings({gameStats}: {gameStats: GameStats}) {
    const startGame = () => {
        RelayWS.sendStartGame(gameStats.game_id);
    };
    const user = useRecoilValue(userAtom);
    return (
        <>
            <h2 className="xl">{gameStats.phase}</h2>
            {gameStats.phase == 'Init' && (
                <>
                    <div className="divider">Settings</div>
                    <div className="shadow">
                        <div className="stat">
                            <div className="stat-figure text-neutral">
                                <Settings />
                            </div>
                            <div className="stat-desc">Time per turn</div>
                            <div className="stat-value">
                                {gameStats.turn_time_secs} secs
                            </div>
                        </div>
                    </div>
                    {user?.user_id === gameStats.host_user_id && (
                        <>
                            <div className="divider"></div>
                            <button
                                className="btn btn-block btn-primary"
                                onClick={startGame}
                            >
                                Play
                            </button>
                        </>
                    )}
                </>
            )}
            {gameStats.phase == 'InProg' && (
                <h1 className="m-5 text-3xl font-bold">{'<Clock />'}</h1>
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
    return (
        <div className="flex flex-col gap-2 mx-6 w-72">
            <h1 className="m-5 text-4xl font-bold">{gameStats.game_id}</h1>
            <GameSettings gameStats={gameStats} />
            <div className="divider">{playerIds.length} Players</div>
            <div className="flex flex-col gap-2 w-72 max-h-full overflow-x-visible no-scrollbar">
                <PlayerListItem
                    playerId={gameStats.host_user_id}
                    gameStats={gameStats}
                    isHost={true}
                />
                {playerIds
                    .filter((k) => k != gameStats.host_user_id)
                    .map((id) => (
                        <PlayerListItem
                            playerId={id}
                            key={id}
                            gameStats={gameStats}
                        />
                    ))}
            </div>
        </div>
    );
}

function PlayerListItem({
    playerId,
    gameStats,
    isHost = false,
}: {
    playerId: string;
    gameStats: GameStats;
    isHost?: boolean;
}): JSX.Element {
    const userId = useRecoilValue(userAtom);
    const player = useRecoilValue(
        gamePlayersAtomFamily({user_id: playerId, game_id: gameStats.game_id})
    );
    return (
        <div className="shadow">
            <div className={'indicator stat bg-' + strColor(playerId)}>
                {isHost && <div className="stat-title text-black">Host</div>}
                {playerId === userId?.user_id && (
                    <div className="indicator-item indicator-start badge badge-primary">
                        💻
                    </div>
                )}
                <div className="text-black font-bold">
                    {playerId || <pre></pre>}
                </div>
                <div className="stat-desc opacity-100 text-black flex flex-row gap-1 w-28">
                    <span className="px-1 bg-gray-300 bg-opacity-40 rounded-md">
                        <img
                            className="inline pr-1"
                            alt="Health Token"
                            src="/Heart.png"
                        ></img>
                        {player?.lives}
                    </span>
                    <span className="px-1 bg-gray-300 bg-opacity-40 rounded-md">
                        <img
                            className="inline pr-1"
                            alt="Action Points"
                            src="/ActionToken.png"
                        ></img>
                        {player?.action_points}
                    </span>
                </div>
                <div className="stat-figure text-neutral">• • •</div>
            </div>
        </div>
    );
}
