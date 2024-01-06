class SubMission{
    /** 
     * @param {Source|Structure|Creep|ConstructionSite|RoomPosition|number} target Can be an object, a RoomPosition or a FIND_ constant
     * @param {string} actionString
     * @param {Object} options Can be resource, room or filterFunction
     */
    constructor(target, actionString, options = {}){
        this.target = target;
        this.actionString = actionString;
        this.resource = (options.hasOwnProperty("resource")) ? options.resource : undefined;
        this.room = (options.hasOwnProperty("room")) ? options.room : undefined;
        this.filterFunction = (options.hasOwnProperty("filterFunction")) ? options.filterFunction : undefined;
        switch (true) {
            case [Source, Structure, Creep, ConstructionSite, Tombstone, Ruin, Resource].some(item => this.target instanceof item):
                this.type = "target";
                break;
            case this.target instanceof RoomPosition:
                this.type = "roomPosition";
                break;
            case typeof this.target == "number":
                this.type = "find";
                break;
        }
    }
    isStillRelevant() {
        if (!["transfer", "build", "withdraw"].includes(this.actionString)) {
            return true;
        }
        let energyComingSoon = Memory.rooms[this.room].missions
        .filter(mission => mission.subMissionsList.some(subMission => subMission[0] === this.target.id && subMission[1] == this.actionString) && mission.creep != null)
        .reduce((total, mission) => {
            if (Game.creeps[mission.creep]) {
                total += Game.creeps[mission.creep].getActiveBodyparts(CARRY) * 50;
            }
            return total;
        }, 0);
        switch (this.actionString) {
            case "transfer":
                return this.target.store.getFreeCapacity(RESOURCE_ENERGY) - energyComingSoon > 0;
            case "build":
                return this.target.progressTotal - this.target.progress - energyComingSoon > 0;
            case "withdraw":
                return this.target.store.getUsedCapacity(RESOURCE_ENERGY) - energyComingSoon > 0;
        }
        return true;
    }
}
Object.defineProperty(SubMission, "hash", {
    get: function() {
        this._hash ??= (str(this.target) + this.actionString + this.room + str(Game.time)).split("").reduce(function(a, b) {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        return this._hash;
    }
});
Object.defineProperty(SubMission, "isStillRelevant", {
    get: function() {
        if (!["transfer", "build", "withdraw"].includes(this.actionString)) {
            return true;
        }
        let energyComingSoon = Memory.rooms[this.room].missions
        .filter(mission => mission.subMissionsList.any(subMission => subMission[0] === this.target.id && subMission[1] == this.actionString) && mission.creep != null)
        .reduce((total, mission) => {
            if (Game.creeps[mission.creep]) {
                total += Game.creeps[mission.creep].getActiveBodyparts(CARRY) * 50;
            }
            return total;
        }, 0);
        switch (this.actionString) {
            case "transfer":
                return this.target.store.getFreeCapacity(RESOURCE_ENERGY) - energyComingSoon > 0;
            case "build":
                return this.target.progressTotal - this.target.progress - energyComingSoon > 0;
            case "withdraw":
                return this.target.store.getUsedCapacity(RESOURCE_ENERGY) - energyComingSoon > 0;
        }
        return true;
    }
})
module.exports = SubMission;