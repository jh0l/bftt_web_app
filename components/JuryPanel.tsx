import {
    gamePlayersAliveDeadAtomFamily,
    GameStats,
    playerCurseAtomFamily,
    setCurseAtom,
} from '../state/game';
import {atom, useRecoilState, useRecoilValue} from 'recoil';
import {userAtom} from '../state/user';
import {JuryTile} from './Tile';
import {useEffect, useState} from 'react';
import {strColor} from '../lib/colors';

interface JuryListProps {
    alive: string[];
    dead: string[];
    gameStats: GameStats;
}
function JuryList({alive, dead, gameStats}: JuryListProps) {
    return (
        <div className="z-0 flex flex-row flex-wrap gap-1 justify-center">
            {dead.map((x) => (
                <JuryTile user_id={x} game_id={gameStats.game_id} key={x} />
            ))}
            {alive.slice(0, -3).map((_, i) => (
                <div
                    key={i}
                    className="w-10 h-10 flex justify-center items-center animate-bounce-once select-none p-1 rounded-lg shadow-md z-10 opacity-50 hover:opacity-70"
                >
                    <img
                        alt="Empty Chair"
                        title="Empty Chair"
                        style={{filter: 'invert(0.5)'}}
                        src="/Chair.png"
                    ></img>
                </div>
            ))}
        </div>
    );
}

function JuryMember({user_id, game_id}: {user_id: string; game_id: string}) {
    const vote = useRecoilValue(playerCurseAtomFamily({user_id, game_id}));
    const [votingCurse, setVotingCurse] = useRecoilState(setCurseAtom);
    return (
        <div className="m-1 p-3 relative border-base border-2 rounded-lg flex flex-col">
            <div className="text-center font-bold text-sm">
                YOU ARE A JURY MEMBER
            </div>
            {vote ? (
                <>
                    <span className="text-center p-2 pt-1">
                        Voted:{' '}
                        <span
                            className={
                                'text-xl font-bold ' +
                                (vote ? 'text-' + strColor(vote) : '')
                            }
                        >
                            {vote}
                        </span>
                    </span>
                    <div className="w-full text-center">
                        {!votingCurse ? (
                            <button
                                className="text-center btn btn-xs btn-outline mt-1 text-gray-500"
                                onClick={() => setVotingCurse(true)}
                            >
                                change
                            </button>
                        ) : (
                            <span className="animate-pulse text-gray-500">
                                choosing again
                            </span>
                        )}
                    </div>
                </>
            ) : (
                <span className="font-bold text-center text-primary mt-1.5 p-1">
                    VOTE TO CURSE
                </span>
            )}
        </div>
    );
}
export function JuryPanel({gameStats}: {gameStats: GameStats}) {
    const user = useRecoilValue(userAtom);
    const players_alive_dead = useRecoilValue(
        gamePlayersAliveDeadAtomFamily(gameStats.game_id)
    );
    if (!players_alive_dead || !user) return null;
    const {alive, dead} = players_alive_dead;
    return (
        <>
            <div className="divider">Jury</div>
            <JuryList alive={alive} dead={dead} gameStats={gameStats} />
            {dead.includes(user.user_id) && (
                <JuryMember
                    user_id={user.user_id}
                    game_id={gameStats.game_id}
                />
            )}
        </>
    );
}
