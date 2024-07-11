/* eslint-disable @typescript-eslint/naming-convention */

import * as fs from "fs";
import * as path from "path";

import { DependencyContainer } from "tsyringe";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import type { GameController } from "@spt/controllers/GameController";
import type { IEmptyRequestData } from "@spt/models/eft/common/IEmptyRequestData";
// WTT imports
import { WTTInstanceManager } from "./WTTInstanceManager";

import { CustomItemService } from "./CustomItemService";

import * as config from "../config/config.json";

class UnheardKukri
    implements IPreSptLoadMod, IPostDBLoadMod {
    private Instance: WTTInstanceManager = new WTTInstanceManager();
    private version: string;
    private modName = "Unheard Kukri: Unity Store Edition";

    private CustomItemService: CustomItemService = new CustomItemService();

    debug = false;

    newIdMap = {
        unheard_kukri: "dbc4ad69f6dfdf10965f46e4"
    };

    // Anything that needs done on preSptLoad, place here.
    public preSptLoad(container: DependencyContainer): void {
        // Initialize the instance manager DO NOTHING ELSE BEFORE THIS
        this.Instance.preSptLoad(container, this.modName);
        this.Instance.debug = this.debug;
        // EVERYTHING AFTER HERE MUST USE THE INSTANCE
        this.fixStupidMongoIds();
        this.getVersionFromJson();
        this.displayCreditBanner();

        this.CustomItemService.preSptLoad(this.Instance);

    }

    // Anything that needs done on postDBLoad, place here.
    postDBLoad(container: DependencyContainer): void {
        // Initialize the instance manager DO NOTHING ELSE BEFORE THIS
        this.Instance.postDBLoad(container);
        // EVERYTHING AFTER HERE MUST USE THE INSTANCE

        this.CustomItemService.postDBLoad();

        if (config.changePlayerPockets) {

            const items = this.Instance.database.templates.items;
            let pockets = items["627a4e6b255f7527fb05a0f6"]
            pockets._props.Grids[1]._props.cellsH = 1
            pockets._props.Grids[1]._props.cellsV = 2
            pockets._props.Grids[2]._props.cellsH = 1
            pockets._props.Grids[2]._props.cellsV = 2
        }

        this.Instance.logger.log(
            `[${this.modName}] Database: Loading complete.`,
            LogTextColor.GREEN
        );
    }

    public fixStupidMongoIds(): void {
        // On game start, see if we need to fix issues from previous versions
        // Note: We do this as a method replacement so we can run _before_ SPT's gameStart
        this.Instance.container.afterResolution("GameController", (_, result: GameController) => {
            const originalGameStart = result.gameStart;

            result.gameStart = (url: string, info: IEmptyRequestData, sessionID: string, startTimeStampMS: number) => {
                // If there's a profile ID passed in, call our fixer method
                if (sessionID) {
                    this.fixProfile(sessionID);
                }

                // Call the original
                originalGameStart.apply(result, [url, info, sessionID, startTimeStampMS]);
            }
        });
    }

    // Handle updating the user profile between versions:
    // - Update the container IDs to the new MongoID format
    // - Look for any key cases in the user's inventory, and properly update the child key locations if we've moved them
    public fixProfile(sessionId: string) {
        const pmcProfile = this.Instance.profileHelper.getFullProfile(sessionId)?.characters?.pmc;
    
        // Do nothing if the profile isn't initialized
        if (!pmcProfile?.Inventory?.items) return;
    
        // Update the container IDs to the new MongoID format for inventory items
        pmcProfile.Inventory.items.forEach(item => {
            if (this.newIdMap[item._tpl]) {
                item._tpl = this.newIdMap[item._tpl];
                console.log("Updated profile item to " + item._tpl);
            }
        });


    
        // Helper function to update rewards for quests
        const updateQuestRewards = (quests: any[]) => {
            if (!quests) return;
            
            quests.forEach(quest => {
                if (quest.rewards?.Success) {
                    quest.rewards.Success.forEach(reward => {
                        if (this.newIdMap[reward._tpl]) {
                            reward._tpl = this.newIdMap[reward._tpl];
                        }
                        if (Array.isArray(reward.items)) {
                            reward.items.forEach(item => {
                                if (this.newIdMap[item._tpl]) {
                                    item._tpl = this.newIdMap[item._tpl];
                                    console.log("Updated reward item to " + item._tpl);
                                }
                            });
                        }
                    });
                }
            });
        };

        
        // Update rewards for Repeatable Quests
        pmcProfile.RepeatableQuests.forEach(questType => {
            updateQuestRewards(questType.activeQuests);
            updateQuestRewards(questType.inactiveQuests);
        });

    }33
    private getVersionFromJson(): void {
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

    private displayCreditBanner(): void {
        this.Instance.logger.log(
            `[${this.modName}] ------------------------------------------------------------------------`,
            LogTextColor.GREEN
        );
        this.Instance.logger.log(
            `[${this.modName}] 380 Release build`,
            LogTextColor.GREEN
        );
        this.Instance.logger.log(
            `[${this.modName}] Developers:           GroovypenguinX`,
            LogTextColor.GREEN
        );
        this.Instance.logger.log(
            `[${this.modName}] Money me. Money now. Me a money needing a lot now.`,
            LogTextColor.GREEN
        );
        this.Instance.logger.log(
            `[${this.modName}] ------------------------------------------------------------------------`,
            LogTextColor.GREEN
        );
    }
}

module.exports = { mod: new UnheardKukri() };
