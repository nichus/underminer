    private containerMiner(maxEnergy: number) {
        const comboCost = 2 * BODYPART_COST[WORK] + BODYPART_COST[MOVE]
        maxEnergy = maxEnergy - comboCost;
        const count = Math.min(7, Math.max(0, Math.floor(maxEnergy / comboCost)))
        return [MOVE, WORK, WORK].concat(Array(2 * count).fill(WORK)).concat(Array(count).fill(MOVE))
    }
