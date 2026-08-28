export const themes = [
    {
        id: "observatory",
        name: "Light",
        number: "01",
        description: "White, black, and grey.",
        palette: ["#ffffff", "#111111", "#6b6b6b", "#e6e6e6"],
        recommended: true,
    },
    {
        id: "signal",
        name: "Dark",
        number: "02",
        description: "Black, white, and grey.",
        palette: ["#111111", "#f4f4f4", "#9a9a9a", "#2a2a2a"],
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
