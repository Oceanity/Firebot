"use strict";

const path = require("path");
const logger = require("../../../logwrapper");
const importHelpers = require("../import-helpers");
const fse = require("fs-extra");
const profileManager = require("../../../common/profile-manager");

const v4ScriptsPath = path.join(importHelpers.v4DataPath, "/scripts");
const v5ScriptsPath = profileManager.getPathInProfile("/scripts");

async function checkForV4Scripts() {
    let hasScripts = false;
    try {
        let files = await fse.readdir(v4ScriptsPath);
        hasScripts = files != null && files.length > 0;
    } catch (err) {
        logger.warn("Unable to read scripts folder.", err);
    }
    return hasScripts;
}

exports.run = async () => {
    let incompatibilityWarnings = [];

    let v4ScriptsExist = await checkForV4Scripts();

    if (v4ScriptsExist) {
        try {
            await fse.copy(v4ScriptsPath, v5ScriptsPath);
        } catch (err) {
            incompatibilityWarnings.push("Unable to import V4 Scripts as an error occured.");
            logger.warn("Unable to copy v4 scripts.", err);
        }
    }

    return {
        success: true,
        incompatibilityWarnings: incompatibilityWarnings
    };
};