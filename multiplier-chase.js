// Script for BC Game Crash https://crashwinbet.com/go/bcgame/ and Nanogames https://crashwinbet.com/go/nanogames
// More info @ https://crashwinbet.com/multiplier-chase-strategy/

var config = {
  baseBet: { value: 100, type: "number", label: "Base Bet" },
  chasingMultiplier: { value: 10, type: "number", label: "Multiplier" },
  gamesToWait: {
    value: 25,
    type: "number",
    label: "Games to wait before making a bet",
  },
  multiplyOrAdd: {
    value: "multiply",
    type: "radio",
    label: "Multiply or Add",
    options: [
      { value: "multiply", label: "Multiply by" },
      { value: "add", label: "Add to bet" },
    ],
  },
  multiplyValue: {
    value: 2,
    type: "number",
    label: "Multiply by",
  },
  addValue: {
    value: 100,
    type: "number",
    label: "Add to bet",
  },
  modifyBetEvery: {
    value: 5,
    type: "number",
    label: "Modify bet every x games",
  },
  stopCondition: {
    value: "maxBet",
    type: "radio",
    label: "Stop condition",
    options: [
      { value: "maxBet", label: "Stop if bet is more than" },
      {
        value: "negativeProfit",
        label: "Stop if negative profit is more than",
      },
    ],
  },
  stopConditionValue: {
    value: 10000,
    type: "number",
    label: "Value for Stop condition",
  },
};
function main() {
  let baseBet = config.baseBet.value;
  const multiplier = config.chasingMultiplier.value;
  let gamesToWait = config.gamesToWait.value;
  let multiplyOrAdd = config.multiplyOrAdd.value;
  let multiplyValue, addValue;
  if (multiplyOrAdd === "multiply") {
    multiplyValue = config.multiplyValue.value;
  }
  if (multiplyOrAdd === "add") {
    addValue = config.addValue.value;
  }
  const modifyBetEvery =
    config.modifyBetEvery.value === 0 ? 1 : config.modifyBetEvery.value;
  let stopCondition = config.stopCondition.value;
  let maxBet, maxNegativeProfit;
  if (stopCondition === "maxBet") {
    maxBet = config.stopConditionValue.value;
  }
  if (stopCondition === "negativeProfit") {
    maxNegativeProfit = config.stopConditionValue.value;
  }
 
  let isBetting = false;
  let userProfit = 0;
  let gamesWithoutMultiplier = gamesWithoutX(multiplier);
  let bettingGames = 0;
  let numberOfCashout = 0;
 
  log.info("FIRST LAUNCH | WELCOME!");
  log.info(
    `It has been ${gamesWithoutMultiplier} games without ${multiplier}×`
  );
 
  game.on("GAME_STARTING", function () {
    //Do some pretty logs
    log.info("*******");
    log.info("NEW GAME");
    log.info(`Games without ${multiplier}×: ${gamesWithoutMultiplier}.`);
    log.info(
      `Actual profit using the script: ${userProfit}. Got ${numberOfCashout} times ${multiplier}×.`
    );
 
    if (gamesWithoutMultiplier >= gamesToWait) {
      // Place the bet
      game.bet(baseBet, multiplier);
      isBetting = true;
      let wantedProfit = baseBet * (multiplier - 1) + userProfit;
      log.info(
        `Betting ${baseBet} right now, looking for ${wantedProfit} bits total profit.`
      );
    } else {
      // Waiting
      isBetting = false;
      let calculatedGamesToWait = gamesToWait - gamesWithoutMultiplier;
      if (calculatedGamesToWait === 1) {
        log.info(`Betting ${baseBet} next game!`);
      } else {
        log.info(
          `Waiting for ${calculatedGamesToWait} more games with no ${multiplier}×`
        );
      }
    }
  });
 
  game.on("GAME_ENDED", function () {
    let lastGame = game.history[0];
    if (isBetting) {
      if (!lastGame.cashedAt) {
        log.error("Lost...");
 
        userProfit -= baseBet;
        bettingGames++;
 
        if (bettingGames % modifyBetEvery === 0) {
          if (multiplyValue !== undefined) {
            baseBet *= multiplyValue;
          }
          if (addValue !== undefined) {
            baseBet += addValue;
          }
        }
 
        if (maxBet !== undefined && baseBet > maxBet) {
          game.stop(
            `Script stopped. Max bet reached: ${maxBet}. Profit is: ${userProfit}.`
          );
        } else if (
          maxNegativeProfit !== undefined &&
          userProfit > maxNegativeProfit
        ) {
          game.stop(
            `Script stopped. Max deficit reached: ${userProfit}. Next bet would have been: ${baseBet}`
          );
        }
      } else {
        //Won
        log.success("Won! Returning to base bet");
        userProfit += baseBet * multiplier - baseBet;
        baseBet = config.baseBet.value;
        bettingGames = 0;
        numberOfCashout++;
      }
    }
    if (lastGame.odds >= multiplier) {
      gamesWithoutMultiplier = 0;
    } else {
      gamesWithoutMultiplier++;
    }
    log.info(`Current profit: ${userProfit}`);
    log.info("END GAME");
  });
 
  function gamesWithoutX(x) {
    let gamesArray = game.history;
    let result = 0;
 
    for (let i = 0; i < gamesArray.length; i++) {
      if (gamesArray[i].odds >= x) {
        break;
      }
      result++;
    }
    return result;
  }
}