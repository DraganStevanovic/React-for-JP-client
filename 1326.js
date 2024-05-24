var config = {
  initialBet: { value: 1, type: 'number', label: 'Initial Bet' },
  targetMultiplier: { value: 2, type: 'number', label: 'Target Multiplier' } // Example multiplier
};

function main () {
  let currentBet = config.initialBet.value;
  let stage = 0; // To keep track of the betting stage

  game.onBet = function () {
    log.info('Game is starting, current bet: ' + currentBet);

    // Adjust the bet based on the stage and place the bet
    let betMultiplier = config.targetMultiplier.value; // Example usage of multiplier
    game.bet(currentBet, betMultiplier).then(function(payout) {
      if (payout > 0) {
        log.success('Won the bet with payout: ' + payout);
        stage++;
        switch(stage) {
          case 1:
            currentBet *= 3; // 3 times initial bet
            break;
          case 2:
            currentBet = config.initialBet.value * 2; // 2 times initial bet
            break;
          case 3:
            currentBet = config.initialBet.value * 6; // 6 times initial bet
            break;
          default:
            currentBet = config.initialBet.value; // Reset to initial bet
            stage = 0;
        }
      } else {
        log.error('Lost the bet');
        currentBet = config.initialBet.value; // Reset to initial bet
        stage = 0;
      }
    });
  };

  game.on('GAME_ENDED', function() {
    log.info('Game ended');
  });
}
