const Mission = require("./Mission");
const SubMission = require("./SubMission");

const missionCenter = {
    alertHostileCreep: function(roomName) {
        const hostileCreeps = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS).filter(creep => creep.getActiveBodyparts(ATTACK) > 0) || (creep.getActiveBodyparts(RANGED_ATTACK) > 0);
        for (const hostileCreep of hostileCreeps) {
            const myDefenselessCreeps = hostileCreep.pos.findInRange(FIND_MY_CREEPS, 10).filter(myCreep => !myCreep.memory.scared && myCreep.getActiveBodyparts(ATTACK) == 0 && myCreep.getActiveBodyparts(RANGED_ATTACK) == 0);
            for (let myCreep of myDefenselessCreeps) {
                debugger;
                myCreep.say("😨");
                myCreep.memory.scared = true;
                myCreep.memory.mission.subMissionsList = [];
                myCreep.mission.subMission = [myCreep.memory.home, "moveTo", Game.getObjectById(myCreep.memory.home).pos.roomName, null];
            }
        }
    },
    updateList: function(roomName) {
        try {
            if (Game.time % 3) {
                return;
            }
            if (roomName == "W51N4") {
                if (!Game.rooms[roomName].missions.some(mission => mission.name == -545252065) && Game.getObjectById("5bbcaa509099fc012e63124f").energy == 0 && Game.getObjectById("5bbcaa509099fc012e63124e").energy == 0) {
                    this._createMission(roomName, [
                        new SubMission(new RoomPosition(29, 48, "W51N4"), "moveTo"),
                        new SubMission("5bbcaa509099fc012e631251", "harvest", {room:"W51N3"}),
                        new SubMission(new RoomPosition(29, 1, "W51N3"), "moveTo", {room:"W51N3"})
                    ], 2, "return creep.ticksToLive > 400 && creep.memory.type == 'worker' && creep.store.getUsedCapacity() == 0");
                }
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

                [[[new SubMission(FIND_STRUCTURES, "upgradeController", {filterFunction: structure => (structure.structureType === STRUCTURE_CONTROLLER) && structure.my, resource: RESOURCE_ENERGY})], 0, 'return ["worker", "linkOp"].includes(creep.memory.type)'], null],
                [[[new SubMission(FIND_HOSTILE_CREEPS, "attack")], 4, 'return creep.memory.type == "fighter"'], null],
                [[[new SubMission(FIND_MY_CREEPS, "heal", {filterFunction: creep => creep.hitsMax - creep.hits > 0})], 4, 'return creep.structureType == STRUCTURE_TOWER'], null],
                [[[new SubMission(FIND_RUINS, "withdraw", {filterFunction: ruin => ruin.store.getUsedCapacity(RESOURCE_ENERGY) > 0, resource: RESOURCE_ENERGY})], 3, 'return creep.memory.type == "worker"'], null],
                [[[new SubMission(FIND_TOMBSTONES, "withdraw", {filterFunction: tomb => tomb.store.getUsedCapacity() && (tomb.pos.findInRange(FIND_HOSTILE_CREEPS, 5).length == 0)})], 3, 'return creep.memory.type == "worker"'], null],
                [[[new SubMission(FIND_DROPPED_RESOURCES, "pickup", {filterFunction: ress => ress.amount > 50})], 3, 'return ["worker", "linkOp"].includes(creep.memory.type)'], null],
                [[[new SubMission(FIND_MY_STRUCTURES, "transfer", {filterFunction: struct => (struct.structureType === STRUCTURE_SPAWN) && (struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0), resource: RESOURCE_ENERGY})], 3, 'return creep.memory.type == "worker"'], null],
                [[[new SubMission(FIND_MY_STRUCTURES, "transfer", {filterFunction: struct => [STRUCTURE_EXTENSION, STRUCTURE_TOWER].includes(struct.structureType) && (struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0), resource: RESOURCE_ENERGY})], 2, 'return creep.memory.type == "worker"'], null],
                [[[new SubMission(FIND_STRUCTURES, "transfer", {filterFunction: struct => (struct.structureType === STRUCTURE_CONTAINER) && struct.store.getFreeCapacity(RESOURCE_ENERGY), resource: RESOURCE_ENERGY})], 2, 'return creep.memory.type == "worker"'], null],
                [[[new SubMission(FIND_MY_CONSTRUCTION_SITES, "build", {resource: RESOURCE_ENERGY})], 1, 'return creep.memory.type == "worker"'], null],
                [[[new SubMission(FIND_MY_STRUCTURES, "transfer", {filterFunction: struct => (struct.structureType === STRUCTURE_LINK) && (struct.memory.type === "sender") && (struct.store.getFreeCapacity(RESOURCE_ENERGY) > 50), resource: RESOURCE_ENERGY})], 1, 'return creep.memory.type == "linkOp"'], null],
                [[[new SubMission(FIND_STRUCTURES, "repair", {filterFunction: struct => [STRUCTURE_ROAD, STRUCTURE_CONTAINER].includes(struct.structureType) && (struct.hitsMax - struct.hits > 0), resource: RESOURCE_ENERGY})], 1, 'return creep.memory.type == "worker"'], null],
                [[[new SubMission(FIND_MY_STRUCTURES, "repair", {filterFunction: struct => struct.hitsMax - struct.hits > 0, resource: RESOURCE_ENERGY})], 1, 'return creep.memory.type == "worker"'], null]
            ]) {
                if (hash == null || !Game.rooms[roomName].missions.some(mission => mission.name == hash)) {
                    this._createMission(roomName, ...mission);
                }
            }
            Game.rooms[roomName].missions = Game.rooms[roomName].missions.sort((a, b) => b.priority - a.priority);
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
            const missionsNames = Game.rooms[roomName].missions.filter(mission => mission.creep == undefined).map(mission => mission.name);
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
                const hash = this.getHash(name);
                if (!missionsNames.includes(hash)) {
                    Game.rooms[roomName].missions.push({name: hash, room: roomName, priority: priority, type: creepType, subMissionsList: encodedSubMissions});
                }

            }
        }catch(err){
            console.log("missionCenter _createMission " + err);
        }
    }
};

module.exports = missionCenter;