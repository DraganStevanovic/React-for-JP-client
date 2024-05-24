var config = {
  targetMultiplierTitle: {
    type: "title",
    label: "Target Multiplier",
  },
  targetMultiplier: {
    value: 2.0,
    type: "number",
    label: "The multiplier at which you plan to cash out",
  },
  bankrollTitle: {
    type: "title",
    label: "Bankroll",
  },
  bankroll: {
    value: 100,
    type: "number",
    label: "Your current bankroll for betting",
  },
  sampleSizeTitle: {
    type: "title",
    label: "Sample Size",
  },
  sampleSize: {
    value: 50,
    type: "number",
    label: "Number of past games to analyze",
  },
};

let gameData = [];

function main() {
  let isInit = true;

  game.on("GAME_STARTING", () => {
    if (gameData.length >= config.sampleSize.value) {
      const winProbability = calculateWinProbability(
        gameData,
        config.targetMultiplier.value
      );
      const betSize = calculateKellyBetSize(
        config.bankroll.value,
        winProbability,
        config.targetMultiplier.value - 1
      );

      if (betSize > 0 && betSize <= config.bankroll.value) {
        log.info(
          `Placing a bet of ${betSize} with target multiplier of ${config.targetMultiplier.value}.`
        );
        game
          .bet(betSize, config.targetMultiplier.value)
          .then((multiplier) => {
            const winAmount = betSize * multiplier - betSize;
            config.bankroll.value += winAmount;
            const info = `Result: ${
              multiplier >= config.targetMultiplier.value ? "Win" : "Loss"
            }, New Bankroll: ${config.bankroll.value}`;
            if (multiplier >= config.targetMultiplier.value) {
              log.success(info);
            } else {
              log.error(info);
            }
          })
          .catch((err) => {
            log.error(`Error placing bet: ${err.message}`);
            game.stop();
          });
      } else {
        log.info("Kelly Criterion advises not to bet this round.");
      }
    } else {
      log.info(`Collecting game data, current size: ${gameData.length}.`);
    }
  });

  game.on("GAME_ENDED", function () {
    if (isInit) {
      gameData.push(...game.history);
    }
    isInit = false;
    gameData.push(game.history[0]);

    // Remove the oldest game outcome to keep the array size within 'sampleSize'
    // Removing the oldest game outcome after reaching a certain sample size, typically done in a rolling window approach to data analysis, aims to keep the dataset relevant to the current state of the game.
    if (gameData.length > config.sampleSize.value) {
      gameData.shift();
    }
  });

  function calculateWinProbability(games, targetMultiplier) {
    const wins = games.filter((game) => game.odds >= targetMultiplier).length;
    log.info(`Games: ${games.length}`);
    log.info(`Winnings ${targetMultiplier}x: ${wins}`);
    log.info(`Losses ${targetMultiplier}x: ${games.length - wins}`);
    return wins / games.length;
  }

  function calculateKellyBetSize(bankroll, winProbability, netOdds) {
    const q = 1 - winProbability; // Probability of losing
    const betFraction = (netOdds * winProbability - q) / netOdds; // Kelly formula
    return Math.max(bankroll * betFraction, 0); // Calculate bet size; ensure it's not negative
  }
}
