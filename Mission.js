class Mission{
    /** 
     * @param {string} name 
     * @param {number} priority
     * @param {string} type
     * @param {(Source|Structure|Creep|ConstructionSite)} target 
     * @param {boolean} need_energy
     */
    constructor(name, priority, type, target, need_energy = false){
        this.name = name;
        this.priority = priority;
        this.type = type;
        this.target = target;
        this.need_energy = need_energy;
       /** @type {string} */
        this.creep = undefined;
    }
}
module.exports = Mission;