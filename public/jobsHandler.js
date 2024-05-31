const anyJobMatches = (metadata1, otherJobs) => {
    return (
        otherJobs
            .map((job) => job.metaData)
            .findIndex((metadata2) => {
                const keys1 = Object.keys(metadata1);
                const keys2 = Object.keys(metadata2);
                if (keys1.length !== keys2.length) {
                    return false;
                }
                for (const key of keys1) {
                    if (metadata1[key] !== metadata2[key]) {
                        return false;
                    }
                }
                return true;
            }) !== -1
    );
};

const getJobsHandler = () => {
    let primaryJobs = [];
    let secondaryJobs = [];
    let loopRunning = false;

    const addPrimaryJob = (metaData, callback) => {
        if (!anyJobMatches(metaData, primaryJobs)) {
            primaryJobs.push({ metaData, callback });
            if (!loopRunning) {
                executeJobs();
            }
        }
    };

    const addSecondaryJob = (metaData, callback) => {
        if (!anyJobMatches(metaData, secondaryJobs)) {
            secondaryJobs.push({ metaData, callback });
            if (!loopRunning) {
                executeJobs();
            }
        }
    };

    const executeJobs = () => {
        if (primaryJobs.length) {
            loopRunning = true;
            const job = primaryJobs[0];
            primaryJobs = primaryJobs.slice(1);
            job.callback()
                .then((res) => {
                    executeJobs();
                })
                .catch((res) => {
                    primaryJobs.push(job);
                    executeJobs();
                });
            return;
        }
        if (secondaryJobs.length) {
            loopRunning = true;
            const job = secondaryJobs[0];
            secondaryJobs = secondaryJobs.slice(1);
            job.callback()
                .then((res) => {
                    executeJobs();
                })
                .catch((res) => {
                    executeJobs();
                });
            return;
        }
        loopRunning = false;
    };

    return {
        addPrimaryJob,
        addSecondaryJob,
    };
};

module.exports = {
    getJobsHandler,
};
