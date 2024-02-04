module.exports = {
    reactToTick: function() {
        try {
            ROOM = "W53N7";
            if (!Game.rooms[ROOM].terminal.cooldown && Memory.market.length > 0) {
                let orders = Memory.market.shift();
                orders.forEach(order => {
                    let answer = Game.market.deal(order[0], order[1], ROOM);
                    if (answer != 0) {
                        console.log(`Error with order id ${order[0]}, qty ${order[1]}: error ${answer} `)
                    }
                });
            }
        } catch(err) {
            console.log("Error marketAi.reactToTick: ", err)
        }
    }
}