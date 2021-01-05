function getMockMove(id) {
  let move = {};
  move.nr = id + "abc";
  move.turn = "white";
  move.move = "e3e4";
  move.depth = id * 2;
  move.vs = id + " : " + (id + 2);
  move.worker = id % 2 === 1 ? "warburg" : "pawelek";
  move.failed_times = 100 - id;
  move.vm_time = (300 - id) / 1000 + "s";
  move.total_time = (1000 - id) / 1000 + "s";
  move.offers_count = 50 + id;
  move.cost = 50 + id;
  return move;
}
function getMockMoves(count) {
  return Array.from(Array(count).keys()).map((id) => getMockMove(id + 1));
}

export { getMockMoves };
