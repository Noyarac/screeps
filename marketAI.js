module.exports = {
    reactToTick: function() {
        try {
            const ENERGY_PRICE = 18;
            const MAX_AMOUNT = 2000;
            const BUY_ROOM_NAME = "W52N9";
            const SELL_ROOM_NAME = "W51N9";
            const BUY_TERMINAL = Game.rooms[BUY_ROOM_NAME].terminal;
            const SELL_TERMINAL = Game.rooms[SELL_ROOM_NAME].terminal;
            const BUY_ENERGY_ORDER_ID = "65c2be248dd24e0012f9f40f";
            const SELL_ENERGY_ORDER_ID = "65c33dde8dd24e0012271037";
            const BALANCE_ENERGY_QTY = 0.04;
            const ORDER_FEE = 1.05;

            // Buy energy for transport
            for (const [terminal, orderId, wait] of [[BUY_TERMINAL, BUY_ENERGY_ORDER_ID, "b_w"], [SELL_TERMINAL, SELL_ENERGY_ORDER_ID, "s_w"]]) {
                if (terminal.store.getUsedCapacity(RESOURCE_ENERGY) < MAX_AMOUNT && !Memory.market[wait]) {
                    if (Game.market.extendOrder(orderId, 6000) == OK) {
                        Memory.market[wait] = true;
                    }
                }
                if (Game.market.getOrderById(orderId).remainingAmount == 0) {
                    Memory.market[wait] = false;
                }
            }
            

            if (BUY_TERMINAL.cooldown || SELL_TERMINAL.cooldown ||
                BUY_TERMINAL.store.getUsedCapacity(RESOURCE_ENERGY) < MAX_AMOUNT ||
                SELL_TERMINAL.store.getUsedCapacity(RESOURCE_ENERGY) < MAX_AMOUNT
                ) return;
            if (Memory.market.balance) {
                const [resourceType, amount] = Memory.market.balance;
                if (BUY_TERMINAL.send(resourceType, amount, SELL_ROOM_NAME) == OK) {
                    Memory.market.balance = undefined;
                }
            } else {
                const RESOURCES_IN_STOCK = {
                    GO: SELL_TERMINAL.store.getUsedCapacity("GO"),
                    ZH: SELL_TERMINAL.store.getUsedCapacity("ZH"),
                    UH: SELL_TERMINAL.store.getUsedCapacity("UH"),
                    KO: SELL_TERMINAL.store.getUsedCapacity("KO"),
                    Z: SELL_TERMINAL.store.getUsedCapacity("Z"),
                    liquid: SELL_TERMINAL.store.getUsedCapacity("liquid"),
                    K: SELL_TERMINAL.store.getUsedCapacity("K"),
                    // purifier: SELL_TERMINAL.store.getUsedCapacity("purifier"),
                    // ops: SELL_TERMINAL.store.getUsedCapacity("ops")
                }
                let orders_buy = new Object;
                let orders_sell = new Object;
                for (const resourceType in RESOURCES_IN_STOCK) {
                    orders_buy[resourceType] = new Array;
                    orders_sell[resourceType] = new Array;
                    const orders = Game.market.getAllOrders({resourceType: resourceType});
                    for (let order of orders) {
                        switch(order.type) {
                            case ORDER_BUY:
                                order.realPrice = order.price - (Game.market.calcTransactionCost(order.remainingAmount, SELL_ROOM_NAME, order.roomName)) * ENERGY_PRICE * ORDER_FEE / order.remainingAmount;
                                orders_buy[order.resourceType].push(order);
                                break;
                            case ORDER_SELL:
                                order.realPrice = order.price + (Game.market.calcTransactionCost(order.remainingAmount, BUY_ROOM_NAME, order.roomName)) * ENERGY_PRICE * ORDER_FEE / order.remainingAmount;
                                orders_sell[order.resourceType].push(order);
                                break;
                        }
                    }
                    const best_buy_order = orders_buy[resourceType].reduce((best_buy, current_order) => (current_order.realPrice > best_buy.realPrice) ? current_order : best_buy);
                    const best_sell_order = orders_sell[resourceType].reduce((best_sell, current_order) => (current_order.realPrice < best_sell.realPrice) ? current_order : best_sell);
                    const quantity = Math.min(MAX_AMOUNT, RESOURCES_IN_STOCK[resourceType], best_buy_order.remainingAmount, best_sell_order.remainingAmount);
                    if ((best_buy_order.realPrice - best_sell_order.realPrice - BALANCE_ENERGY_QTY * ENERGY_PRICE * ORDER_FEE) > 0) {
                        Game.market.deal(best_buy_order.id, quantity, SELL_ROOM_NAME);
                        Game.market.deal(best_sell_order.id, quantity, BUY_ROOM_NAME);
                        Memory.market.balance = [resourceType, quantity];
                        break;
                    }
                }
            }
        } catch(err) {
            console.log("Error marketAi.reactToTick: ", err)
        }
    }
}