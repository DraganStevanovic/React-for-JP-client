var config = {
  baseBet: { value: 1, type: "number", label: "Base Bet" },
};

function main() {
  let betSize = config.baseBet.value;
  let profit = 0;
  let unit = config.baseBet.value;

  game.on("GAME_STARTING", function () {
    if (profit === unit) {
      log.success("Target profit reached. Resetting.");
      profit = 0; // Reset profit for a new session
      betSize = unit; // Reset betSize for the new session
    }

    log.info("Placing bet of " + betSize);

    game
      .bet(betSize, 2)
      .then(function (payout) {
        if (payout > 0) {
          profit += betSize;
          if (profit < unit) {
            if (profit + betSize + unit > unit) {
              betSize = unit - profit; // Adjust betSize to ensure exactly 1 unit profit
            } else {
              betSize += unit;
            }
          }
          log.success(
            "Won! Current profit: " + profit + ". Next bet: " + betSize
          );
        } else {
          profit -= betSize;
          log.error(
            "Lost. Current profit: " + profit + ". Next bet: " + betSize
          );
        }
      })
      .catch(function (err) {
        log.error("Error placing bet: " + err);
      });
  });
}
