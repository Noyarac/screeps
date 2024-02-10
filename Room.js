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
    });
    Object.defineProperty(p, "sources", {
        get: function() {
            if (!this.memory.sources) {
                this.memory.sources = this.find(FIND_SOURCES).map(source => [source.id]);
            }
            return this.memory.sources;
        },
        set: function(value) {
            this.memory.sources = value;
        },
        configurable: true
    });
}