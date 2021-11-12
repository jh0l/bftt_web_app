import {Player, Pos} from '../state/game';

function xyDist(a: Pos, b: Pos) {
    let x, y;
    if (a.x < b.x) x = b.x - a.x;
    else x = a.x - b.x;
    if (a.y < b.y) y = b.y - a.y;
    else y = a.y - b.y;
    return {x, y};
}
export default function inRange(
    {pos, range, action_points}: Player,
    dest: Pos
) {
    if (!action_points) return false;
    let dist = xyDist(pos, dest);
    if (dist.x > range || dist.y > range) {
        return false;
    }
    return true;
}
