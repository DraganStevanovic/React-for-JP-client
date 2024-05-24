// Script for BC Game Crash https://crashwinbet.com/go/bcgame/ and Nanogames https://crashwinbet.com/go/nanogames
// More info @ https://crashwinbet.com/fibonacci-strategy/

var config = {
    baseBet: { value: 1, type: 'number', label: 'Base Bet' },
    maxSteps: { value: 10, type: 'number', label: 'Max Fibonacci Steps' },
    payout: { value: 2, type: 'number', label: 'Payout' }
};
 
let currentStep = 1;

function main() {
    let fibSequence = [1, 1];
    for (let i = 2; i <= config.maxSteps.value; i++) {
        fibSequence[i] = fibSequence[i - 1] + fibSequence[i - 2];
    }    
 
    game.onBet = function() {
        let betAmount = config.baseBet.value * fibSequence[currentStep];
        betAmount = Math.max(betAmount, currency.minAmount);
 
        if (betAmount > currency.maxAmount) {
            log.error('Bet amount is too high. Maximum is ' + currency.maxAmount);
            game.stop();
            return;
        }
 
        if (betAmount > currency.amount) {
            log.error('Insufficient balance to place the bet.');
            game.stop();
            return;
        }
 
        game.bet(betAmount, config.payout.value).then(payout => {
            if (payout > 0) {
                log.success('Won! Payout: ' + payout);
                currentStep = Math.max(1, currentStep - 2);
            } else {
                log.info('Lost. Moving to the next step in Fibonacci sequence.');
                currentStep = Math.min(currentStep + 1, config.maxSteps.value);
            }
        });
    };
 
    game.on('GAME_STARTING', function() {
        log.info('Game is starting. Betting ' + (config.baseBet.value * fibSequence[currentStep]));
    });
 
    game.on('GAME_ENDED', function() {
        log.info('Game ended.');
    });
}