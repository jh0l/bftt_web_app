export default function JoinGameInput() {
    return (
        <div className="form-control">
            <label className="label">
                <span className="label-text">Join a game:</span>
            </label>
            <div className="relative">
                <input
                    type="text"
                    placeholder="Game ID"
                    className="w-full pr-16 input input-primary input-bordered"
                />
                <button className="absolute top-0 right-0 rounded-l-none btn btn-primary">
                    go
                </button>
            </div>
        </div>
    );
}
