import { JsonObject } from "type-fest";
import logger from "../../../../../backend/logwrapper";
import { EffectType } from "../../../../../types/effects";
import { createSource } from "../obs-remote";

export const CreateSourceEffectType: EffectType<{
    sourceSelectMode: "dropdown" | "custom";
    inputKind?: string;
    sceneName?: string;
    inputName?: string;
    inputSettings?: string;
    hideSource?: boolean;
}> = {
    definition: {
        id: "firebot:obs-create-source",
        name: "Create OBS Source",
        description: "Creates an OBS Source in the specified scene with options",
        icon: "fad fa-layer-plus",
        categories: ["common"]
    },
    optionsTemplate: `
        <eos-container>
            <firebot-radios
                options="selectSceneOptions"
                model="effect.sourceSelectMode">
            </firebot-radios>
        </eos-container>
        <eos-container header="OBS Scene" pad-top="true">
            <div>
                <button class="btn btn-link" ng-click="getScenes()">Refresh Scene Data</button>
            </div>
            <ui-select ng-if="scenes != null" ng-model="effect.sceneName">
                <ui-select-match placeholder="Select a Scene...">{{$select.selected.name}}</ui-select-match>
                <ui-select-choices repeat="scene.name as scene in scenes | filter: {name: $select.search}">
                    <div ng-bind-html="scene.name | highlight: $select.search"></div>
                </ui-select-choices>
                <ui-select-no-choice>
                    <b>No Scenes found.</b>
                </ui-select-no-choice>
            </ui-select>
        </eos-container>
        <eos-container ng-if="inputKinds != null && effect.sceneName != null" header="Source Type" pad-top="true">
            <div>
                <button class="btn btn-link" ng-click="getInputKinds()">Refresh Source Types</button>
            </div>
            <firebot-select
                options="inputKinds"
                selected="effect.inputKind"
                on-update="selectInputKind(effect.inputKind)" />
        </eos-container>
        <eos-container ng-if="effect.inputKind != null" header="Settings" pad-top="true">
            <firebot-input
                style="margin-bottom: 20px;"
                model="effect.inputName" 
                placeholder-text="Source Name"
                menu-position="under" />
            <div class="alert alert-warning">
                <p style="margin: 0">
                    <b>Note:</b> OBS WebSocket does not currently offer a way to pull all settings fields for an OBS Source, so some settings may be missing from the provided defaults.
                </p>
            </div>
            <div
                ui-codemirror="{onLoad : codemirrorLoaded}"
                ui-codemirror-opts="editorSettings"
                ng-model="effect.inputSettings"
                replace-variables
                menu-position="under">
            </div>
            <firebot-checkbox
                label="Hide Created Source"
                model="effect.hideSource"
                style="margin-top: 15px" />
        </eos-container>
    `,
    optionsController: ($scope: any, backendCommunicator: any) => {
        $scope.isObsConfigured = false;
        $scope.isUsingInvalidItemId = false;

        $scope.scenes = [];
        $scope.inputKinds = {};
        $scope.defaultSettings = {};

        $scope.selectSceneOptions = {
            dropdown: {
                text: "Select Source",
                description: "Pick the Scene and Source from dropdown lists"
            },
            custom: {
                text: "Custom",
                description: "Manually specify the Scene and Source by Name"
            }
        };
        if (!$scope.effect.sourceSelectMode) {
            $scope.effect.sourceSelectMode = "dropdown";
        }

        $scope.editorSettings = {
            mode: {name: "javascript", json: true},
            theme: "blackboard",
            lineNumbers: true,
            autoRefresh: true,
            showGutter: true
        };

        $scope.codemirrorLoaded = function(_editor) {
            // Editor part
            _editor.refresh();
            const cmResize = require("cm-resize");
            cmResize(_editor, {
                minHeight: 200,
                resizableWidth: false,
                resizableHeight: true
            });
        };

        $scope.selectInputKind = (inputKind: string) => {
            $scope.effect.inputKind = inputKind;
            $scope.getDefaultSettings(inputKind);
        };

        $scope.getScenes = () => {
            $scope.isObsConfigured = backendCommunicator.fireEventSync("obs-is-configured");

            backendCommunicator.fireEventAsync("obs-get-scene-list").then(
                (scenes: string[] | undefined) => {
                    $scope.scenes = scenes?.map(scene => ({ name: scene, custom: false })) ?? [];
                    $scope.scenes.push($scope.customScene);

                    if ($scope.effect.sceneName != null) {
                        $scope.getSources($scope.effect.sceneName);
                    }
                }
            );
        };
        $scope.getScenes();

        $scope.getInputKinds = () => {
            $scope.isObsConfigured = backendCommunicator.fireEventSync("obs-is-configured");

            backendCommunicator.fireEventAsync("obs-get-source-types").then(
                (inputKinds: string[] | null) => {
                    if (!inputKinds) {
                        return;
                    }

                    $scope.inputKinds = {};
                    inputKinds.sort((a, b) => a.localeCompare(b)).forEach((inputKind) => {
                        const label = inputKind
                            .replace(/[-_]/g, " ")
                            .split(" ")
                            .map(part => `${part.charAt(0).toLocaleUpperCase()}${part.slice(1).toLocaleLowerCase()}`)
                            .join(" ");
                        $scope.inputKinds[inputKind] = label;
                    });
                }
            );
        };
        $scope.getInputKinds();

        $scope.getDefaultSettings = (inputKind: string) => {
            $scope.isObsConfigured = backendCommunicator.fireEventSync("obs-is-configured");

            backendCommunicator.fireEventAsync("obs-get-source-default-settings", [inputKind]).then(
                (defaultSettings: JsonObject) => {
                    $scope.effect.inputSettings = JSON.stringify(defaultSettings, null, 2);
                }
            );
        };
    },
    optionsValidator: (effect) => {
        if (effect.inputKind == null) {
            return ["Please select a source type."];
        }
        if (effect.inputName == null) {
            return ["Please enter a source name."];
        }
        return [];
    },
    getDefaultLabel: (effect) => {
        return effect.inputKind ?? "";
    },
    onTriggerEvent: async ({ effect }) => {
        try {
            const { sceneName, hideSource, inputName, inputSettings, inputKind } = effect;

            const parsedSettings = !!inputSettings
                ? JSON.parse(inputSettings)
                : {};

            await createSource({
                sceneName,
                inputKind,
                inputName,
                inputSettings: parsedSettings,
                sceneItemEnabled: !hideSource
            });

            return true;
        } catch (error) {
            logger.error("Failed to create OBS source", error);
        }
    }
};
