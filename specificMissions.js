const SubMission = require("./SubMission");
module.exports = [
    {
        room: "W53N7",
        condition: () => Game.getObjectById("65acec1790ea90c8dc01cb9f").store.getUsedCapacity(RESOURCE_ENERGY) > 12000,
        creepSelection: "return [WORK, MOVE, CARRY].every(bodypartType => creep.getActiveBodyparts(bodypartType)) && creep.store.getUsedCapacity() == 0 && creep.ticksToLive > 100",
        priority: 3,
        listOfSubMissions: [
            new SubMission("659187f846d80fa3601ae462", "transfer", {resource: RESOURCE_ENERGY}),
            new SubMission("65acec1790ea90c8dc01cb9f", "withdraw", {resource: RESOURCE_ENERGY})
        ]
    },
    {
        room: "W52N9",
        condition: () => ["5bbcaa3b9099fc012e6310b1", "5bbcaa3b9099fc012e6310b0"].every((id) => Game.getObjectById(id).energy == 0),
        creepSelection: "return [WORK, MOVE, CARRY].every(bodypartType => creep.getActiveBodyparts(bodypartType)) && creep.store.getUsedCapacity() == 0 && creep.ticksToLive > 100",
        priority: 2,
        listOfSubMissions: [
            new SubMission(new RoomPosition(2, 17, "W52N9"), "moveTo"),
            new SubMission("5bbcaa279099fc012e630f2a", "harvest"),
            new SubMission(new RoomPosition(47, 18, "W53N9"), "moveTo")
        ]
    },
    {
        room: "W53N7",
        condition: () => ["5bbcaa279099fc012e630f30", "5bbcaa279099fc012e630f31"].every((id) => Game.getObjectById(id).energy == 0),
        creepSelection: "return [WORK, MOVE, CARRY].every(bodypartType => creep.getActiveBodyparts(bodypartType)) && creep.store.getUsedCapacity() == 0 && creep.ticksToLive > 100",
        priority: 2,
        listOfSubMissions: [
            new SubMission(new RoomPosition(48, 37, "W53N7"), "moveTo"),
            new SubMission("5bbcaa3b9099fc012e6310b8", "harvest"),
            new SubMission(new RoomPosition(1, 36, "W52N7"), "moveTo")
        ]
    },
    {
        room: "W51N4",
        condition: () => Game.getObjectById("659d5b98f748b5ca4c990fad").store.getUsedCapacity(RESOURCE_ZYNTHIUM) > 0,
        creepSelection: "return [WORK, MOVE, CARRY].every(bodypartType => creep.getActiveBodyparts(bodypartType)) && creep.store.getUsedCapacity() == 0 && creep.ticksToLive > 100",
        priority: 2,
        listOfSubMissions: [
            new SubMission("65bfdae6a399e33ffa58b46c", "transfer", {resource: RESOURCE_ZYNTHIUM}),
            new SubMission("659d5b98f748b5ca4c990fad", "withdraw", {resource: RESOURCE_ZYNTHIUM}),
        ]
    },
    {
        room: "W51N4",
        condition: () => Game.getObjectById("65bfdae6a399e33ffa58b46c").store.getUsedCapacity(RESOURCE_ENERGY) < 200,
        creepSelection: "return [WORK, MOVE, CARRY].every(bodypartType => creep.getActiveBodyparts(bodypartType)) && creep.store.getUsedCapacity() == 0 && creep.ticksToLive > 100",
        priority: 2,
        listOfSubMissions: [
            new SubMission("65bfdae6a399e33ffa58b46c", "transfer", {resource: RESOURCE_ENERGY})
        ]
    },
    {
        room: "W51N4",
        condition: () => ["5bbcaa509099fc012e63124e", "5bbcaa509099fc012e63124f"].every((id) => Game.getObjectById(id).energy == 0),
        creepSelection: "return [WORK, MOVE, CARRY].every(bodypartType => creep.getActiveBodyparts(bodypartType)) && creep.store.getUsedCapacity() == 0 && creep.ticksToLive > 100",
        priority: 2,
        listOfSubMissions: [
            new SubMission(new RoomPosition(28, 48, "W51N4"), "moveTo"),
            new SubMission("5bbcaa509099fc012e631251", "harvest"),
            new SubMission(new RoomPosition(28, 1, "W51N3"), "moveTo")
        ]
    },
    {
        room: "W51N4",
        condition: () => Game.getObjectById("65c46624a73b270a9e784bab").store.getUsedCapacity(RESOURCE_SILICON) > 0,
        creepSelection: "return [WORK, MOVE, CARRY].every(bodypartType => creep.getActiveBodyparts(bodypartType)) && creep.store.getUsedCapacity() == 0 && creep.ticksToLive > 300",
        priority: 2,
        listOfSubMissions: [
            new SubMission("65bfdae6a399e33ffa58b46c", "transfer", {resource:RESOURCE_SILICON}),
            new SubMission("65c46624a73b270a9e784bab", "withdraw", {resource:RESOURCE_SILICON})
        ]
    }
    // {
    //     room: "W51N4",
    //     condition: () => Game.getObjectById("65bedf50a6fd9a17f4d0b6d4").cooldown == 0,
    //     creepSelection: "return [WORK, MOVE, CARRY].every(bodypartType => creep.getActiveBodyparts(bodypartType)) && creep.store.getUsedCapacity() == 0 && creep.ticksToLive > 300",
    //     priority: 1,
    //     listOfSubMissions: [
    //         new SubMission("5bbcb13d40062e4259e92cc9", "harvest")
    //     ]
    // }
]