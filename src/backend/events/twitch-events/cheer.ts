import eventManager from "../../events/EventManager";

export function triggerCheer(
    userName: string,
    isAnonymous: boolean,
    bits: number,
    totalBits: number,
    cheerMessage: string
): void {
    eventManager.triggerEvent("twitch", "cheer", {
        username: userName,
        isAnonymous,
        bits,
        totalBits,
        cheerMessage
    });
};

export function triggerBitsBadgeUnlock(
    userName: string,
    message: string,
    badgeTier: number
): void {
    eventManager.triggerEvent("twitch", "bits-badge-unlocked", {
        username: userName,
        message,
        badgeTier
    });
};