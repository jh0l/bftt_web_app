import {GameStats} from '../state/game';
import {useCallback, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {Tile} from './Tile';
import GameSidebar from './GameSidebar';
import {useResizeDetector} from 'react-resize-detector';

export function Board({gameStats}: {gameStats: GameStats}) {
    const [coords, setCoords] = useState({});
    const targetRef = useRef<HTMLDivElement>(null);
    const updateCoords = useCallback(() => {
        const rect = targetRef.current?.getBoundingClientRect();
        if (rect) {
            setCoords({
                left: rect.x,
                top: rect.y,
                width: rect.width,
                height: rect.height,
            });
        }
    }, []);
    const onResize = updateCoords;
    useResizeDetector({onResize, targetRef});
    useLayoutEffect(() => {
        window.addEventListener('resize', updateCoords);
        return () => {
            window.removeEventListener('resize', updateCoords);
        };
    }, [updateCoords]);
    const {boardSize: size, game_id} = gameStats;
    const tileMap = useMemo(() => {
        return Array(size * size)
            .fill(0)
            .map((_, i) => (
                <Tile
                    key={i}
                    i={i}
                    len={size}
                    game_id={game_id}
                    coords={coords}
                />
            ));
    }, [size, game_id, coords]);
    return (
        <div className="md:px-3 overflow-hidden">
            <div className="shadow-lg">
                <div
                    style={{
                        margin: '0 auto',
                        boxSizing: 'border-box',
                        display: 'grid',
                        gridTemplateColumns: `repeat(${size}, 1fr)`,
                        gridTemplateRows: `auto`,
                    }}
                    ref={targetRef}
                >
                    {tileMap}
                </div>
            </div>
        </div>
    );
}

// make size of squares whole numbers, avoid uneven spacing
// formula by Joshua Rasquinha (oklusion) (I'm dumb)
function sizeDivisible(source: number, divisor: number) {
    return source - (source % divisor);
}

function Sizer({children, divisor}: {children: JSX.Element; divisor: number}) {
    const ref = useRef<HTMLDivElement>(null);
    const resizeListener = () => {
        requestAnimationFrame(() => {
            if (ref.current && parent) {
                let {width, height} = document.body.getBoundingClientRect();
                const sizeDirty = Math.min(width, height) - 20;
                const size = sizeDivisible(sizeDirty, divisor) + 'px';
                ref.current.setAttribute('style', 'width: 1px; height: 1px');
                ref.current.style.height = size;
                ref.current.style.width = size;
            }
        });
    };
    useLayoutEffect(() => {
        resizeListener();
        window.addEventListener('resize', resizeListener);
        return () => window.removeEventListener('resize', resizeListener);
    });
    return (
        <div
            // style={{ margin: '0 auto' }}
            ref={ref}
        >
            {children}
        </div>
    );
}

export default function Game({
    gameStats,
    playerIds,
}: {
    gameStats: GameStats;
    playerIds: string[];
}) {
    return (
        <div className="flex flex-grow flex-col-reverse lg:flex-row-reverse justify-center items-center lg:items-start">
            <GameSidebar gameStats={gameStats} playerIds={playerIds} />
            <Sizer divisor={gameStats.boardSize}>
                <Board gameStats={gameStats} />
            </Sizer>
        </div>
    );
}
