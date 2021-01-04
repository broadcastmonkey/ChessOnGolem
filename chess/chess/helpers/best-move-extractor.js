const ExtractBestMove = (data) => {
  let bestmove = { move: "", depth: 0, time: 0 };

  var lines = data.split(/\r?\n/);
  if (lines.length > 2) {
    line_0 = lines[0];
    line_1 = lines[1];
    line_2 = lines[2];
    line_3 = lines[3];

    if (!line_0.includes("ponder")) line_0 = line_0 + " ponder";
    if (line_0.includes("bestmove") && line_0.includes("ponder")) {
      line_0 = line_0
        .substring(
          line_0.indexOf("bestmove") + "bestmove".length,
          line_0.indexOf("ponder")
        )
        .trim();
    }

    if (line_2.includes("exec time:"))
      bestmove.time = line_2.substring(
        line_2.indexOf("exec time:") + "exec time:".length
      );

    if (line_1.includes("depth:"))
      bestmove.depth = line_1.substring(
        line_2.indexOf("depth:") + "depth:".length
      );
    if (line_3.includes("hash:"))
      bestmove.hash = line_3.substring(
        line_3.indexOf("hash:") + "hash:".length
      );

    bestmove.move = line_0;
    /*  bestmove.depth = line_1;
    bestmove.time = line_2;
    bestmove.hash = line_3;*/
  }

  return bestmove;
};

module.exports = {
  ExtractBestMove,
};
