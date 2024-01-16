const Mission = require("./Mission");
const SubMission = require("./SubMission");

const missionCenter = {
    updateList: function(roomName) {
        try {
            if (Memory.rooms[roomName] == undefined) {
                Memory.rooms[roomName] = new Object;
                Memory.rooms[roomName].missions = [];
            }
            for (const [mission, hash] of [
                // [[[
                //     new SubMission("659187f846d80fa3601ae462", "transfer", {ressource: RESOURCE_ENERGY}),
                //     new SubMission("657a52104a8d812d2c5d1f71", "withdraw", {room:"W54N7", resource:RESOURCE_ENERGY}),
                //     new SubMission(new RoomPosition(9,47,"W53N8"), "moveTo")
                // ], 4, "stealer"], 997259388],
                // [[[
                //     new SubMission("659187f846d80fa3601ae462", "transfer", {ressource: RESOURCE_ENERGY}),
                //     new SubMission("6584d6fbe2a2f9f1be57bfec", "withdraw", {room:"W54N7", resource:RESOURCE_ENERGY}),
                //     new SubMission(new RoomPosition(48,25,"W54N7"), "moveTo")
                // ], 4, "stealer"], -1495925381],

                // [[[new SubMission("659187f846d80fa3601ae462", "transfer", {resource: RESOURCE_ENERGY})], 5, "stealer"], null],

                [[[new SubMission(FIND_STRUCTURES, "upgradeController", {filterFunction: structure => (structure.structureType === STRUCTURE_CONTROLLER) && structure.my, resource: RESOURCE_ENERGY})], 0, "worker"], null],
                [[[new SubMission(FIND_HOSTILE_CREEPS, "attack")], 4, "fighter"], null],
                [[[new SubMission(FIND_MY_CREEPS, "heal", {filterFunction: creep => creep.hitsMax - creep.hits > 0})], 4, "tower"], null],
                [[[new SubMission(FIND_HOSTILE_STRUCTURES, "attack", {filterFunction: struct => struct.structureType != STRUCTURE_KEEPER_LAIR})], 3, "fighter"], null],
                [[[new SubMission(FIND_RUINS, "withdraw", {filterFunction: ruin => !(ruin.store.getFreeCapacity() === 0)})], 3, "worker"], null],
                [[[new SubMission(FIND_TOMBSTONES, "withdraw", {filterFunction: tomb => tomb.store.getUsedCapacity() && (tomb.pos.findInRange(FIND_HOSTILE_CREEPS, 5).length == 0)})], 3, "worker"], null],
                [[[new SubMission(FIND_DROPPED_RESOURCES, "pickup", {filterFunction: ress => ress.amount > 50})], 3, "worker"], null],
                [[[new SubMission(FIND_MY_STRUCTURES, "transfer", {filterFunction: struct => (struct.structureType === STRUCTURE_SPAWN) && (struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0), resource: RESOURCE_ENERGY})], 3, "worker"], null],
                [[[new SubMission(FIND_MY_STRUCTURES, "transfer", {filterFunction: struct => [STRUCTURE_EXTENSION, STRUCTURE_TOWER].includes(struct.structureType) && (struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0), resource: RESOURCE_ENERGY})], 2, "worker"], null],
                [[[new SubMission(FIND_STRUCTURES, "transfer", {filterFunction: struct => (struct.structureType === STRUCTURE_CONTAINER) && struct.store.getFreeCapacity(RESOURCE_ENERGY), resource: RESOURCE_ENERGY})], 2, "worker"], null],
                [[[new SubMission(FIND_MY_CONSTRUCTION_SITES, "build", {resource: RESOURCE_ENERGY})], 1, "worker"], null],
                [[[new SubMission(FIND_MY_STRUCTURES, "transfer", {filterFunction: struct => (struct.structureType === STRUCTURE_LINK) && (struct.memory.type === "sender") && (struct.store.getFreeCapacity(RESOURCE_ENERGY) > 50), resource: RESOURCE_ENERGY})], 1, "linkOp"], null],
                [[[new SubMission(FIND_STRUCTURES, "repair", {filterFunction: struct => [STRUCTURE_ROAD, STRUCTURE_CONTAINER].includes(struct.structureType) && (struct.hitsMax - struct.hits > 0), resource: RESOURCE_ENERGY})], 1, "worker"], null],
                [[[new SubMission(FIND_MY_STRUCTURES, "repair", {filterFunction: struct => struct.hitsMax - struct.hits > 0, resource: RESOURCE_ENERGY})], 1, "worker"], null]
            ]) {
                if ((hash == null) || !Memory.rooms[roomName].missions.some(mission => mission.name == hash)) {
                    this._createMission(roomName, ...mission);
                }
            }
            Memory.rooms[roomName].missions = Memory.rooms[roomName].missions.sort((a, b) => b.priority - a.priority);
        }
        catch(err) {
            console.log("Error missionCenter " + err)
        }
    },
    _scanAllSubMissions: function(originalListOfSubMissions, roomName, index = 0, listInProgress = [], listOfNewListOfSubMissions = []) {
        try{
            if (index >= originalListOfSubMissions.length) {
                listOfNewListOfSubMissions.push(listInProgress);
                return listOfNewListOfSubMissions;
            }
        
            if (originalListOfSubMissions[index].room == undefined) {
                originalListOfSubMissions[index].room = roomName;
            }
            let thisFloorTargets = [];
            if (originalListOfSubMissions[index].type === "find") {
                thisFloorTargets = Game.rooms[originalListOfSubMissions[index].room].find(originalListOfSubMissions[index].target);
                if (originalListOfSubMissions[index].filterFunction) {
                    thisFloorTargets = thisFloorTargets.filter(originalListOfSubMissions[index].filterFunction, this);
                }
            } else {
                thisFloorTargets.push(originalListOfSubMissions[index].target);
            }
            if (thisFloorTargets.length == 0) {
                return 1;
            }
            for (let target of thisFloorTargets) {
                let newSubMission = new SubMission(target, originalListOfSubMissions[index].actionString, {resource: originalListOfSubMissions[index].resource, room: originalListOfSubMissions[index].room});
                if (!Object.keys(Game.rooms).includes(newSubMission.room) || newSubMission.isStillRelevant()) {
                    const newListInProgress = listInProgress.map(x => x);
                    newListInProgress.push(newSubMission);
                    listOfNewListOfSubMissions = this._scanAllSubMissions(originalListOfSubMissions, roomName, index + 1, newListInProgress, listOfNewListOfSubMissions);
                }
            }
            return listOfNewListOfSubMissions;
        }catch(err){
            console.log("missionCenter _scanAllSubMissions " + err, index);
        }
    },
    getHash(s) {
        return s.split("").reduce(function(a, b) {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
    },
    _createMission: function(roomName, listOfSubMissions, priority, creepType) {
        try{
            const listOfLists = this._scanAllSubMissions(listOfSubMissions, roomName);
            if (listOfLists == 1) {
                return;
            }
            for (const list of listOfLists) {
                let encodedSubMissions = [];
                let name = ""
                for (const subMission of list) {
                    let target;
                    switch(subMission.type) {
                        case "target":
                            target = subMission.target.id;
                            name += subMission.target.id;
                            break;
                        case "roomPosition":
                            target = [subMission.target.x, subMission.target.y, subMission.target.roomName];
                            name += subMission.target.x.toString() + subMission.target.y.toString();
                            break;
                        case "id":
                            target = subMission.target;
                            name += subMission.target;
                            break;
                    }
                    encodedSubMissions.push([target, subMission.actionString, subMission.room, subMission.resource]);
                    name += subMission.actionString + subMission.room;
                }
                try{
                    const hash = this.getHash(name);
                    if (Memory.rooms[roomName].missions.filter(mission => mission.name == hash && mission.creep == undefined).length == 0) {
                        Memory.rooms[roomName].missions.push({name: hash, room: roomName, priority: priority, type: creepType, subMissionsList: encodedSubMissions});
                    }
                }catch(err){
                    console.log(err)
                }
            }
        }catch(err){
            console.log("missionCenter _createMission " + err);
        }
    }
};

module.exports = missionCenter;