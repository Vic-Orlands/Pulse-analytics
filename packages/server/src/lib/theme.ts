export const themes = [
    {
        id: "observatory",
        name: "The Observatory",
        number: "01",
        description: "Quiet editorial analytics with measured typography and warm telemetry.",
        palette: ["#eae6dc", "#171715", "#7c2f35", "#74745a"],
        recommended: true,
    },
    {
        id: "signal",
        name: "The Signal Room",
        number: "02",
        description: "A darker operational view shaped by live systems and interaction signals.",
        palette: ["#111014", "#f0ece4", "#ff6759", "#81c4cf"],
        recommended: false,
    },
] as const;

export type ThemeId = (typeof themes)[number]["id"];

export const defaultTheme: ThemeId = "observatory";
export const themeStorageKey = "counterscale-theme";

export function isThemeId(value: string | null): value is ThemeId {
    return themes.some((theme) => theme.id === value);
}

export function readTheme(): ThemeId | null {
    const value = window.localStorage.getItem(themeStorageKey);
    return isThemeId(value) ? value : null;
}

export function applyTheme(theme: ThemeId) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === "signal" ? "dark" : "light";
}

export function saveTheme(theme: ThemeId) {
    window.localStorage.setItem(themeStorageKey, theme);
    applyTheme(theme);
}
