import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import {
    createSource,
    getAllSources,
    getAudioSources,
    getBrowserSources,
    getColorSources,
    getGroupList,
    getImageSources,
    getMediaSources,
    getSceneCollectionList,
    getSceneList,
    getSourceData,
    getSourceDefaultSettings,
    getSourceSettings,
    getSourcesWithFilters,
    getSourceTypes,
    getSupportedImageFormats,
    getTextSources,
    getTransformableSceneItems,
    OBSCreateSourceParams,
    OBSSceneItem,
    OBSSource,
    SourceData
} from "./obs-remote";

export function setupFrontendListeners(
    frontendCommunicator: ScriptModules["frontendCommunicator"]
) {
    frontendCommunicator.on<never, string[]>(
        "obs-get-group-list",
        getGroupList
    );

    frontendCommunicator.onAsync<never, string[]>(
        "obs-get-scene-list",
        getSceneList
    );

    frontendCommunicator.onAsync<never, string[]>(
        "obs-get-scene-collection-list",
        getSceneCollectionList
    );

    frontendCommunicator.onAsync<never, SourceData>(
        "obs-get-source-data",
        getSourceData
    );

    frontendCommunicator.onAsync<never, Array<OBSSource>>(
        "obs-get-sources-with-filters",
        getSourcesWithFilters
    );

    frontendCommunicator.onAsync<unknown[], Array<OBSSceneItem>>(
        "obs-get-transformable-scene-items",
        (args: [sceneName: string]) => {
            const [sceneName] = args;
            return getTransformableSceneItems(sceneName);
        }
    );

    frontendCommunicator.onAsync<never, Array<OBSSource>>(
        "obs-get-audio-sources",
        getAudioSources
    );

    frontendCommunicator.onAsync<never, Array<OBSSource>>(
        "obs-get-text-sources",
        getTextSources
    );

    frontendCommunicator.onAsync<never, Array<OBSSource>>(
        "obs-get-browser-sources",
        getBrowserSources
    );

    frontendCommunicator.onAsync<never, Array<OBSSource>>(
        "obs-get-image-sources",
        getImageSources
    );

    frontendCommunicator.onAsync<never, Array<OBSSource>>(
        "obs-get-media-sources",
        getMediaSources
    );

    frontendCommunicator.onAsync<never, Array<OBSSource>>(
        "obs-get-color-sources",
        getColorSources
    );

    frontendCommunicator.onAsync<never, Array<string>>(
        "obs-get-supported-image-formats",
        getSupportedImageFormats
    );

    frontendCommunicator.onAsync<never, Array<OBSSource>>(
        "obs-get-all-sources",
        getAllSources
    );

    frontendCommunicator.onAsync<never, Array<string>>(
        "obs-get-source-types",
        getSourceTypes
    );

    frontendCommunicator.onAsync<[inputName: string], Record<string, unknown>>(
        "obs-get-source-settings",
        (args) => {
            const [inputName] = args;
            return getSourceSettings(inputName);
        }
    );

    frontendCommunicator.onAsync<[inputKind: string], Record<string, unknown>>(
        "obs-get-source-default-settings",
        (args) => {
            const [inputKind] = args;
            return getSourceDefaultSettings(inputKind);
        }
    );

    frontendCommunicator.onAsync<[params: OBSCreateSourceParams], string>(
        "obs-create-source",
        (args) => {
            const [params] = args;
            return createSource(params);
        }
    );
}
