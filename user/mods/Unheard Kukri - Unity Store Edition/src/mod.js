"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const LogTextColor_1 = require("C:/snapshot/project/obj/models/spt/logging/LogTextColor");
// WTT imports
const WTTInstanceManager_1 = require("./WTTInstanceManager");
const CustomItemService_1 = require("./CustomItemService");
const config = __importStar(require("../config/config.json"));
class UnheardKukri {
    Instance = new WTTInstanceManager_1.WTTInstanceManager();
    version;
    modName = "Unheard Kukri: Unity Store Edition";
    CustomItemService = new CustomItemService_1.CustomItemService();
    debug = false;
    // Anything that needs done on preSptLoad, place here.
    preSptLoad(container) {
        // Initialize the instance manager DO NOTHING ELSE BEFORE THIS
        this.Instance.preSptLoad(container, this.modName);
        this.Instance.debug = this.debug;
        // EVERYTHING AFTER HERE MUST USE THE INSTANCE
        this.getVersionFromJson();
        this.displayCreditBanner();
        this.CustomItemService.preSptLoad(this.Instance);
    }
    // Anything that needs done on postDBLoad, place here.
    postDBLoad(container) {
        // Initialize the instance manager DO NOTHING ELSE BEFORE THIS
        this.Instance.postDBLoad(container);
        // EVERYTHING AFTER HERE MUST USE THE INSTANCE
        this.CustomItemService.postDBLoad();
        if (config.changePlayerPockets) {
            const items = this.Instance.database.templates.items;
            let pockets = items["627a4e6b255f7527fb05a0f6"];
            pockets._props.Grids[1]._props.cellsH = 1;
            pockets._props.Grids[1]._props.cellsV = 2;
            pockets._props.Grids[2]._props.cellsH = 1;
            pockets._props.Grids[2]._props.cellsV = 2;
        }
        this.Instance.logger.log(`[${this.modName}] Database: Loading complete.`, LogTextColor_1.LogTextColor.GREEN);
    }
    getVersionFromJson() {
        const packageJsonPath = path.join(__dirname, "../package.json");
        fs.readFile(packageJsonPath, "utf-8", (err, data) => {
            if (err) {
                console.error("Error reading file:", err);
                return;
            }
            const jsonData = JSON.parse(data);
            this.version = jsonData.version;
        });
    }
    displayCreditBanner() {
        this.Instance.logger.log(`[${this.modName}] ------------------------------------------------------------------------`, LogTextColor_1.LogTextColor.GREEN);
        this.Instance.logger.log(`[${this.modName}] 380 Release build`, LogTextColor_1.LogTextColor.GREEN);
        this.Instance.logger.log(`[${this.modName}] Developers:           GroovypenguinX`, LogTextColor_1.LogTextColor.GREEN);
        this.Instance.logger.log(`[${this.modName}] Money me. Money now. Me a money needing a lot now.`, LogTextColor_1.LogTextColor.GREEN);
        this.Instance.logger.log(`[${this.modName}] ------------------------------------------------------------------------`, LogTextColor_1.LogTextColor.GREEN);
    }
}
module.exports = { mod: new UnheardKukri() };
//# sourceMappingURL=mod.js.map