const ExtractBestMove = (data) =>
{
  if(data.includes("bestmove") && data.includes("ponder"))
  {
    return data.substring(data.indexOf("bestmove")+"bestmove".length,data.indexOf("ponder")).trim();
  }
  return "";
}

module.exports={
    ExtractBestMove
}