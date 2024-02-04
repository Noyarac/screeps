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
    // {
    //     room: "W53N7",
    //     condition: () => Game.getObjectById("65acec1790ea90c8dc01cb9f").store.getUsedCapacity(RESOURCE_ENERGY) < 1500,
    //     creepSelection: "return [WORK, MOVE, CARRY].every(bodypartType => creep.getActiveBodyparts(bodypartType)) && creep.store.getUsedCapacity() == 0 && creep.ticksToLive > 100",
    //     priority: 3,
    //     listOfSubMissions: [
    //         new SubMission("65acec1790ea90c8dc01cb9f", "transfer", {resource: RESOURCE_ENERGY}),
    //         new SubMission("659187f846d80fa3601ae462", "withdraw", {resource: RESOURCE_ENERGY})
    //     ]
    // },
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
        condition: () => ["5bbcaa509099fc012e63124e", "5bbcaa509099fc012e63124f"].every((id) => Game.getObjectById(id).energy == 0),
        creepSelection: "return [WORK, MOVE, CARRY].every(bodypartType => creep.getActiveBodyparts(bodypartType)) && creep.store.getUsedCapacity() == 0 && creep.ticksToLive > 100",
        priority: 2,
        listOfSubMissions: [
            new SubMission(new RoomPosition(28, 48, "W51N4"), "moveTo"),
            new SubMission("5bbcaa509099fc012e631251", "harvest"),
            new SubMission(new RoomPosition(28, 1, "W51N3"), "moveTo")
        ]
    },
    //{
    //    room: "W51N9",
    //    condition: () => ["5bbcaa4e9099fc012e63123b", "5bbcaa4e9099fc012e63123c"].every((id) => Game.getObjectById(id).energy == 0),
    //    creepSelection: "return [WORK, MOVE, CARRY].every(bodypartType => creep.getActiveBodyparts(bodypartType)) && creep.store.getUsedCapacity() == 0 && creep.ticksToLive > 100",
    //    priority: 2,
    //    listOfSubMissions: [
    //        new SubMission(new RoomPosition(46, 24, "W51N9"), "moveTo"),
    //        new SubMission("5bbcaa3b9099fc012e6310b0", "harvest"),
    //        new SubMission(new RoomPosition(47, 19, "W52N9"), "moveTo")
    //    ]
    //},
]