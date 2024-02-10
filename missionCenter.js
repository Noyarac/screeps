const SubMission = require("./SubMission");

module.exports = {
    alertHostileCreep: function(roomName) {
        const hostileCreeps = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS).filter(creep => creep.getActiveBodyparts(ATTACK) > 0) || (creep.getActiveBodyparts(RANGED_ATTACK) > 0);
        for (const hostileCreep of hostileCreeps) {
            const myDefenselessCreeps = hostileCreep.pos.findInRange(FIND_MY_CREEPS, 10).filter(myCreep => !myCreep.memory.scared && myCreep.getActiveBodyparts(ATTACK) == 0 && myCreep.getActiveBodyparts(RANGED_ATTACK) == 0);
            for (let myCreep of myDefenselessCreeps) {
                myCreep.say("😨");
                myCreep.memory.scared = true;
                if (myCreep.memory.mission) {
                    myCreep.memory.mission.subMissionsList = [];
                }
                myCreep.mission.subMission = [myCreep.memory.home, "moveTo", Game.getObjectById(myCreep.memory.home).pos.roomName, null];
            }
        }
    },
    updateList: function(roomName) {
        try {
            if (Game.time % 3) {
                return;
            }
            for (const specificMission of require("./specificMissions").filter(specMiss => specMiss.room == roomName)) {
                if (specificMission.condition()) {
                    this._createMission(specificMission.room, specificMission.listOfSubMissions, specificMission.priority, specificMission.creepSelection);
                }
            }
            for (const mission of [
                [[new SubMission(FIND_STRUCTURES, "upgradeController", {filterFunction: structure => (structure.structureType === STRUCTURE_CONTROLLER) && structure.my, resource: RESOURCE_ENERGY})], 0, 'return ["worker", "linkOp"].includes(creep.memory.type)'],
                [[new SubMission(FIND_HOSTILE_CREEPS, "attack")], 4, 'return creep.memory.type == "fighter"'],
                [[new SubMission(FIND_MY_CREEPS, "heal", {filterFunction: creep => creep.hitsMax - creep.hits > 0})], 4, 'return creep.structureType == STRUCTURE_TOWER'],
                [[new SubMission(FIND_RUINS, "withdraw", {filterFunction: ruin => ruin.store.getUsedCapacity(RESOURCE_ENERGY) > 0, resource: RESOURCE_ENERGY})], 3, 'return creep.memory.type == "worker"'],
                [[new SubMission(FIND_TOMBSTONES, "withdraw", {filterFunction: tomb => tomb.store.getUsedCapacity() && (tomb.pos.findInRange(FIND_HOSTILE_CREEPS, 5).length == 0)})], 3, 'return creep.memory.type == "worker"'],
                // [[new SubMission(FIND_DROPPED_RESOURCES, "pickup", {filterFunction: ress => ress.amount > 50})], 3, 'return ["worker", "linkOp"].includes(creep.memory.type)'],
                [[new SubMission(FIND_MY_STRUCTURES, "transfer", {filterFunction: struct => (struct.structureType === STRUCTURE_SPAWN) && (struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0), resource: RESOURCE_ENERGY})], 3, 'return creep.memory.type == "worker"'],
                [[new SubMission(FIND_MY_STRUCTURES, "transfer", {filterFunction: struct => [STRUCTURE_EXTENSION, STRUCTURE_TOWER].includes(struct.structureType) && (struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0), resource: RESOURCE_ENERGY})], 2, 'return creep.memory.type == "worker"'],
                [[new SubMission(FIND_STRUCTURES, "transfer", {filterFunction: struct => (struct.structureType === STRUCTURE_CONTAINER) && struct.store.getFreeCapacity(RESOURCE_ENERGY), resource: RESOURCE_ENERGY})], 2, 'return creep.memory.type == "worker"'],
                [[new SubMission(FIND_MY_CONSTRUCTION_SITES, "build", {resource: RESOURCE_ENERGY})], 1, 'return creep.memory.type == "worker"'],
                [[new SubMission(FIND_MY_STRUCTURES, "transfer", {filterFunction: struct => (struct.structureType === STRUCTURE_LINK) && (struct.memory.type === "sender") && (struct.store.getFreeCapacity(RESOURCE_ENERGY) > 50), resource: RESOURCE_ENERGY})], 1, 'return creep.memory.type == "linkOp"'],
                [[new SubMission(FIND_STRUCTURES, "repair", {filterFunction: struct => [STRUCTURE_ROAD, STRUCTURE_CONTAINER].includes(struct.structureType) && (struct.hitsMax - struct.hits > 0), resource: RESOURCE_ENERGY})], 1, 'return creep.memory.type == "worker"'],
                [[new SubMission(FIND_MY_STRUCTURES, "repair", {filterFunction: struct => struct.hitsMax - struct.hits > 0, resource: RESOURCE_ENERGY})], 1, 'return creep.memory.type == "worker"'],
                [[new SubMission(FIND_MY_STRUCTURES, "transfer", {filterFunction: struct => struct.structureType == STRUCTURE_TERMINAL && struct.store.getUsedCapacity(RESOURCE_ENERGY) < 2500, resource: RESOURCE_ENERGY})], 1, 'return creep.memory.type == "worker"'],
                // [[new SubMission(FIND_MINERALS, "harvest", {filterFunction: mineral => mineral.pos.findInRange(FIND_MY_STRUCTURES, 1).length > 0, resource: RESOURCE_ZYNTHIUM})], 2, 'return creep.memory.type == "worker"']
            ]) {
                this._createMission(roomName, ...mission);
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