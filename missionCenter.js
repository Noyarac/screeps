const Mission = require("./Mission");

const missionCenter = {
    updateList: function(roomName) {
        try {
            if (Memory.rooms[roomName] == undefined) {
                Memory.rooms[roomName] = new Object;
                Memory.rooms[roomName].missions = [];
            }
            for (const [a, b, c, d, e] of [
                [FIND_STRUCTURES, "reserveController", 4, "conqueror", structure => structure.structureType === STRUCTURE_CONTROLLER && structure.owner == undefined],
                [FIND_HOSTILE_CREEPS, "attack", 4, "fighter", null],
                [FIND_MY_CREEPS, "heal", 4, "tower", creep => creep.hitsMax - creep.hits > 0, null],
                [FIND_HOSTILE_STRUCTURES, "attack", 3, "fighter", struct => struct.structureType != STRUCTURE_KEEPER_LAIR],
                [FIND_RUINS, "withdraw", 3, "worker", ruin => !(ruin.store.getFreeCapacity() === 0)],
                [FIND_TOMBSTONES, "withdraw", 3, "worker", tomb => tomb.store.getUsedCapacity()],
                [FIND_DROPPED_RESOURCES, "pickup", 3, "worker", ress => ress.amount > 50],
                [FIND_MY_STRUCTURES, "transfer", 3, "worker", struct => struct.structureType === STRUCTURE_SPAWN && struct.store.getFreeCapacity(RESOURCE_ENERGY)],
                [FIND_MY_STRUCTURES, "transfer", 2, "worker", struct => [STRUCTURE_EXTENSION, STRUCTURE_TOWER].includes(struct.structureType) && struct.store.getFreeCapacity(RESOURCE_ENERGY)],
                [FIND_STRUCTURES, "transfer", 2, "worker", struct => struct.structureType === STRUCTURE_CONTAINER && struct.store.getFreeCapacity(RESOURCE_ENERGY)],
                [FIND_MY_CONSTRUCTION_SITES, "build", 1, "worker", null],
                [FIND_MY_STRUCTURES, "transfer", 1, "linkOp", struct => struct.structureType === STRUCTURE_LINK && struct.memory.type === "sender" && struct.store.getFreeCapacity(RESOURCE_ENERGY) > 50],
                [FIND_STRUCTURES, "repair", 1, "tower", struct => ([STRUCTURE_ROAD, STRUCTURE_CONTAINER].includes(struct.structureType)) && (struct.hitsMax - struct.hits > 0)],
                [FIND_MY_STRUCTURES, "repair", 1, "worker", struct => struct.hitsMax - struct.hits > 0],
                [FIND_STRUCTURES, "upgradeController", 0, "worker", structure => structure.structureType === STRUCTURE_CONTROLLER && structure.my]
            ]) {
                this._createMission(roomName, a, b, c, d, e);
            }
            Memory.rooms[roomName].missions = Memory.rooms[roomName].missions.sort((a, b) => b.priority - a.priority);
        }
        catch(err) {
            console.log("Error missionCenter " + err)
        }
    },
    _createMission: function(roomName, FIND_, actionString, priority, creepType, filterFunction = null, resource = RESOURCE_ENERGY) {
        if (Memory.rooms[roomName] == undefined) {
            Memory.rooms[roomName] = {};
            Memory.rooms[roomName].missions = [];
        }
        let targets;
        if (FIND_ instanceof RoomPosition) {
            targets = [{id: [FIND_.x, FIND_.y, FIND_.roomName]}]
        } else {
            targets = Game.rooms[roomName].find(FIND_);
            if (filterFunction) targets = targets.filter(filterFunction, this)
        }
        for (const target of targets.map(targ => targ.id)) {
            const missionName = `${actionString} ${target}`;
            if (Memory.rooms[roomName].missions.filter(mission => mission.name === missionName && mission.creep === undefined).length === 0 && this._stillInNeed(roomName, missionName, target, actionString)) {                
                Memory.rooms[roomName].missions.push(new Mission(missionName, priority, creepType, [target, actionString, resource]))
            }
        }
    },
    _stillInNeed: function(roomName, missionName, target, actionString) {
        if (!["transfer", "build", "withdraw"].includes(actionString)) {
            return true;
        }
        target = Game.getObjectById(target);
        let energyComingSoon = Memory.rooms[roomName].missions
        .filter(mission => mission.name == missionName && mission.creep != null)
        .reduce((total, mission) => {
            if (Game.creeps[mission.creep]) {
                total += Game.creeps[mission.creep].getActiveBodyparts(CARRY) * 50;
            }
            return total;
        }, 0);
        switch (actionString) {
            case "transfer":
                return target.store.getFreeCapacity(RESOURCE_ENERGY) - energyComingSoon > 0;
            case "build":
                return target.progressTotal - target.progress - energyComingSoon > 0;
            case "withdraw":
                return target.store.getUsedCapacity(RESOURCE_ENERGY) - energyComingSoon > 0;
        }
        return true;
    }
};

module.exports = missionCenter;