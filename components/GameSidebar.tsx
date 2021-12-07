import {
    GamePhase,
    gamePlayersAtomFamily,
    GameStats,
    Player,
    setCurseAtom,
} from '../state/game';
import {strColor} from '../lib/colors';
import {useRecoilState, useRecoilValue} from 'recoil';
import {User, userAtom, userStatusAtom} from '../state/user';
import RelayWS from '../state/websockets';
import Link from 'next/link';
import {GameConfiguration} from './GameConfiguration';
import Scrollbars from 'react-custom-scrollbars';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {JuryPanel} from './JuryPanel';

function Countdown({seconds, duration}: {seconds: number; duration: number}) {
    const [hours, mins, secs] = useMemo(() => {
        if (seconds < 1) return [0, 0, 0];
        const time = new Date(1970, 0, 0, 0, 0, seconds);
        const secs = time.getSeconds();
        const mins = time.getMinutes();
        const hours = time.getHours();
        return [hours, mins, secs];
    }, [seconds]);
    return (
        <div className="font-mono text-lg countdown">
            {duration > 3600 && (
                <>
                    <span
                        style={{'--value': hours} as React.CSSProperties}
                    ></span>
                    h
                </>
            )}
            {duration > 60 && (
                <>
                    <span
                        style={{'--value': mins} as React.CSSProperties}
                    ></span>
                    m
                </>
            )}
            <>
                <span style={{'--value': secs} as React.CSSProperties}></span>s
            </>
        </div>
    );
}

interface ClockProps {
    turnTimeSecs: number;
    turnEndUnix: number;
}
const interval = 1000;
function Clock({turnTimeSecs, turnEndUnix}: ClockProps) {
    const [, setCountdown] = useState(0);
    const to = useRef<NodeJS.Timeout>();
    const updateClock = useCallback(
        (
            timeout = (turnEndUnix * 1000 - Date.now()) % interval || interval
        ) => {
            if (timeout < 1) return;
            to.current = setTimeout(() => {
                setCountdown((x) => x + 1);
                updateClock();
            }, timeout);
        },
        [turnEndUnix]
    );
    useEffect(() => {
        updateClock();
        return () => to.current && clearInterval(to.current);
    }, [updateClock]);
    const remaining = Math.round((turnEndUnix * 1000 - Date.now()) / 1000);
    return (
        <>
            <Countdown seconds={remaining} duration={turnTimeSecs} />
            <progress
                className="progress progress-primary bg-base-content"
                value={remaining / turnTimeSecs}
                max="1"
            ></progress>
        </>
    );
}
const gamePhaseLabels: {[k in GamePhase]: string} = {
    Init: 'Game Setup',
    InProg: 'Game in Progress',
    End: 'Game Over',
};
export function GameParameters({
    gameStats,
    user,
}: {
    gameStats: GameStats;
    user: User;
}) {
    const userStatus = useRecoilValue(userStatusAtom);
    if (!user || !gameStats) return null;
    return (
        <>
            {gameStats.phase == 'Init' && (
                <>
                    <div className="divider">
                        {gamePhaseLabels[gameStats.phase]}
                    </div>
                    <GameConfiguration gameStats={gameStats} user={user} />
                </>
            )}

            {gameStats.phase == 'InProg' && (
                <>
                    <div className="divider">
                        {gamePhaseLabels[gameStats.phase]}
                    </div>
                    <Clock
                        turnEndUnix={gameStats.turn_end_unix}
                        turnTimeSecs={gameStats.config.turn_time_secs}
                    />
                </>
            )}
            {gameStats.phase === 'End' && userStatus?.game_id === null && (
                <>
                    <div className="divider">
                        {gamePhaseLabels[gameStats.phase]}
                    </div>
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

// player list scrollable https://malte-wessel.com/react-custom-scrollbars/
export default function GameSidebar({
    gameStats,
    playerIds,
}: {
    gameStats: GameStats;
    playerIds: string[];
}) {
    const user = useRecoilValue(userAtom);
    const userPlayer = useRecoilValue(
        gamePlayersAtomFamily({
            game_id: gameStats.game_id,
            user_id: user?.user_id || '',
        })
    );
    if (!user?.user_id || !userPlayer) return null;
    const {user_id} = user;
    const startGame = () => {
        RelayWS.sendStartGame(gameStats.game_id);
    };
    const isHost = gameStats.host_user_id === user?.user_id;
    return (
        <Scrollbars style={{width: '320px', height: '100%'}} autoHide>
            <div className="flex flex-col gap-2 ml-3 w-72 mb-6">
                <h1 className="m-5 text-4xl font-bold">{gameStats.game_id}</h1>
                {gameStats.phase !== 'Init' && (
                    <JuryPanel gameStats={gameStats} />
                )}
                {user && <GameParameters gameStats={gameStats} user={user} />}
                <div className="divider">{playerIds.length} Players</div>
                <div className="flex flex-col gap-2 w-72 max-h-full overflow-x-visible no-scrollbar">
                    <PlayerListItem
                        playerId={user_id}
                        gameStats={gameStats}
                        userPlayer={userPlayer}
                        showPoints
                        isHost={gameStats.host_user_id == user_id}
                    />
                    <div className="divider my-0.5"></div>
                    {user_id !== gameStats.host_user_id && (
                        <PlayerListItem
                            playerId={gameStats.host_user_id}
                            gameStats={gameStats}
                            userPlayer={userPlayer}
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
                                userPlayer={userPlayer}
                            />
                        ))}
                </div>
                {gameStats.phase === 'Init' && (
                    <button
                        disabled={!isHost}
                        className="btn btn-block btn-primary mt-4"
                        onClick={startGame}
                    >
                        Start Game
                    </button>
                )}
            </div>
        </Scrollbars>
    );
}

function PlayerListItemAction({
    userPlayer,
    player,
}: {
    userPlayer: Player;
    player: Player;
}) {
    const [votingCurse, setVotingCurse] = useRecoilState(setCurseAtom);
    const curseHandler = () => {
        setVotingCurse(false);
        RelayWS.sendPlayerAction({
            action: {Curse: {target_user_id: player.user_id}},
            user_id: userPlayer.user_id,
            game_id: player.game_id,
        });
    };
    return (
        <>
            {!userPlayer.lives &&
            player.user_id !== userPlayer.user_id &&
            player.lives > 0 &&
            votingCurse ? (
                <button
                    className="absolute right-5 bottom-6 btn btn-sm"
                    onMouseUp={curseHandler}
                >
                    Curse
                </button>
            ) : (
                <div className="absolute right-10 bottom-6 stat-figure text-neutral">
                    • • •
                </div>
            )}
        </>
    );
}

function PlayerListItem({
    playerId,
    userPlayer,
    gameStats,
    isHost = false,
    showPoints,
}: {
    playerId: string;
    userPlayer: Player;
    gameStats: GameStats;
    isHost?: boolean;
    showPoints?: boolean;
}): JSX.Element {
    const userId = useRecoilValue(userAtom);
    const player = useRecoilValue(
        gamePlayersAtomFamily({user_id: playerId, game_id: gameStats.game_id})
    );
    if (!player) return <></>;
    return (
        <div className="shadow">
            <div
                className={
                    'flex flex-col gap-1 indicator relative stat bg-' +
                    strColor(playerId)
                }
                style={{filter: player.lives ? '' : 'opacity(0.2)'}}
            >
                {playerId === userId?.user_id && (
                    <div
                        className="badge badge-primary absolute"
                        style={{top: -8, left: -10}}
                    >
                        💻
                    </div>
                )}
                {isHost && (
                    <div className="stat-title block text-black">Host</div>
                )}
                <div className="w-full block text-black font-bold">
                    {playerId || <></>}
                </div>
                <div className="stat-desc opacity-100 text-black flex flex-row gap-1 w-30 ">
                    <span
                        className={
                            'px-1 rounded-md font-bold ' +
                            (player.lives
                                ? 'bg-white bg-opacity-40'
                                : 'bg-red-500 bg-opacity-90')
                        }
                    >
                        <img
                            className="inline pr-1"
                            alt="Health Token"
                            src="/Heart.png"
                        ></img>
                        {player.lives}
                    </span>
                    <span
                        className={
                            'px-1 rounded-md font-bold ' +
                            (player.lives
                                ? 'bg-white bg-opacity-40'
                                : 'bg-red-500 bg-opacity-90')
                        }
                    >
                        <img
                            className="inline pr-1 pb-0.5"
                            alt="player range"
                            src="/Range.png"
                        ></img>
                        {player.range}
                    </span>
                    {showPoints && (
                        <span className="px-1 btn-primary rounded-md font-bold">
                            <img
                                className="inline pr-1 pb-0.5"
                                alt="player range"
                                src="/ActionToken.png"
                            ></img>
                            {player.action_points ||
                                gameStats.config.init_action_points}
                        </span>
                    )}
                </div>
                <PlayerListItemAction userPlayer={userPlayer} player={player} />
            </div>
        </div>
    );
}
