const SubMission = require("./SubMission");

class Mission{
    /** 
     * @param {string} name 
     * @param {number} priority
     * @param {string} type
     * @param {Array.<SubMission>} subMissionsList
     */
    constructor(name, priority, type, subMissionsList){
        this.name = name;
        this.priority = priority;
        this.type = type;
        this.subMissionList = subMissionsList;
    }
}
module.exports = Mission;