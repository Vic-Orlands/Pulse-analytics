export const themes = [
    {
        id: "observatory",
        name: "Paper",
        number: "01",
        description: "Warm daylight interface with coral signals and quiet type.",
        palette: ["#f3efe6", "#1c1b18", "#d24a3e", "#6f6c64"],
        recommended: true,
    },
    {
        id: "signal",
        name: "Night",
        number: "02",
        description: "Dim operational view for late sessions and live monitoring.",
        palette: ["#121116", "#f4f0e8", "#ff6d5c", "#7ec4cc"],
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
