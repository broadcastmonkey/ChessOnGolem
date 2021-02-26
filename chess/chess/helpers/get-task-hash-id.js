const getTaskIdHash = (gameId, gameStep) => {
    return (
        "hash_" + gameId.toString().padStart(8, "0") + "_" + gameStep.toString().padStart(4, "0")
    );
};

module.exports = {
    getTaskIdHash,
};
