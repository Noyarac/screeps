module.exports = function() {
    const p = Room.prototype;
    Object.defineProperty(p, "missions", {
        get: function() {
            this.memory.missions = this.memory.missions || new Array;
            return this.memory.missions;
        },
        set: function(value) {
            this.memory.missions = value;
        },
        configurable: true
    })
}