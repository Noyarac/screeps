module.exports = function() {
    const p = Room.prototype;
    Object.defineProperty(p, "missions", {
        get: function() {
            Memory.rooms[this.name] = Memory.rooms[this.name] || new Object;
            Memory.rooms[this.name].missions = Memory.rooms[this.name].missions || new Array;
            return Memory.rooms[this.name].missions;
        },
        set: function(value) {
            Memory.rooms[this.name].missions = value;
        },
        configurable: true
    })
}