class Mission{
    /** 
     * @param {string} name 
     * @param {number} priority
     * @param {string} type
     * @param {Array.<(Source|Structure|Creep|ConstructionSite), string>} target 
     */
    constructor(name, priority, type, target, ){
        this.name = name;
        this.priority = priority;
        this.type = type;
        this.target = target;
       /** @type {string} */
        this.creep = undefined;
    }
}
module.exports = Mission;