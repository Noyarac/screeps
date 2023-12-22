class Mission{
    /** 
     * @param {string} uid 
     * @param {number} priority
     * @param {string} type
     * @param {Array.<(Source|StructureSpawn)>} targets 
     */
    constructor(uid, priority, type, targets){
        this.uid = uid;
        this.priority = priority;
        this.type = type;
        this.targets = targets;
       /** @type {string} */
        this.creep = undefined;
    }
}
module.exports = Mission;