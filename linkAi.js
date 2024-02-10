module.exports = function() {
    let p = StructureLink.prototype;
    Object.defineProperty(p, "memory", {
        get: function() {
            if (Memory.links[this.id] == undefined) {
                Memory.links[this.id] = {id: this.id};
            }
            return Memory.links[this.id];
        },
        enumerable: false,
        configurable: true,
    });
    p.reactToTick = function() {
        try {
            if (this.memory.type === "sender") {
                if (this.memory.sendTo == undefined) {
                    const target = Object.values(Memory.links).filter(lnk => lnk.type === "receiver").map(o => o.id);
                    this.memory.sendTo = target[0];
                }
                const receiver = Game.getObjectById(this.memory.sendTo);
                if (receiver.store.getFreeCapacity(RESOURCE_ENERGY)/receiver.store.getCapacity(RESOURCE_ENERGY) > 0.05) {
                    this.transferEnergy(Game.getObjectById(this.memory.sendTo));
                }
            }
        }
        catch(err) {
            console.log("Problem linkAi " + err);
        }
    }

}