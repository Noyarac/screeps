module.exports = function() {
    const SOURCE_ID = 0;
    const CONTAINER_ID = 1;
    const MOVER_ID = 2;
    const HARVESTER_ID = 3;
    const p = Room.prototype;
    p.manageHarvesting = function() {
        const sources = this.sources;
        const eventLog = {build: new Array, destroyed: new Array};
        for (const event of this.getEventLog()) {
            switch(event.event) {
                case EVENT_BUILD:
                    eventLog.build.push(event)
                case EVENT_OBJECT_DESTROYED:
                    eventLog.destroyed.push(event)
            }
        }
        const builtContainers = eventLog.build
            .filter(event => event.data.incomplete == false && event.data.structureType == STRUCTURE_CONTAINER)
            .map(event => new RoomPosition(event.data.x, event.data.y, this.name).lookFor(LOOK_STRUCTURES).filter(struct => struct.structureType == STRUCTURE_CONTAINER)[0]);
        for (const container of builtContainers) {
            for (const [index, [sourceId, _]] of sources.entries()) {
                if (Game.getObjectById(sourceId).pos.isNearTo(container)) {
                    sources[index][1] = container.id;
                }
            }
        }
        const destroyedIds = eventLog.destroyed.map(event => event.objectId)
        for (let [index, [sourceId, containerId, moverId, harvesterId]] of sources.entries()) {
            if (destroyedIds.includes(moverId)) {
                this.sources[index][2] = undefined;
            }
            if (destroyedIds.includes(harvesterId)) {
                debugger;
                this.sources[index][3] = undefined;
            }
        }
        const deadCreeps = eventLog.destroyed
            .filter(destroyed => this.sources.reduce((acc, val) => {acc.push(val[2]); acc.push(val[3]); return acc}, new Array).includes(destroyed.id))
    }
    Object.defineProperty(p, "missions", {
        get: function() {
            this.memory.missions = this.memory.missions || new Array;
            return this.memory.missions;
        },
        set: function(value) {
            this.memory.missions = value;
        },
        configurable: true
    });
    Object.defineProperty(p, "sources", {
        get: function() {
            if (!this.memory.sources) {
                this.memory.sources = this.find(FIND_SOURCES).map(source => [source.id, null, null, null]);
                let containers = this.find(FIND_STRUCTURES).filter(struct => struct.structureType == STRUCTURE_CONTAINER);
                let harvesters = this.find(FIND_MY_CREEPS).filter(creep => creep.memory.type == "harvester");
                for (let [index, [sourceId, containerId, moverId, harvesterId]] of this.memory.sources.entries()) {
                    const sourcePos = Game.getObjectById(sourceId).pos;
                    for (const container of containers) {
                        if (sourcePos.isNearTo(container)) {
                            this.memory.sources[index][CONTAINER_ID] = container.id;
                        }
                    }
                    for (const harvester of harvesters) {
                        if (sourcePos.isNearTo(harvester)) {
                            this.memory.sources[index][HARVESTER_ID] = harvester.id;
                        }
                    }
                }
            }
            return this.memory.sources;
        },
        set: function(value) {
            this.memory.sources = value;
        },
        configurable: true
    });
}