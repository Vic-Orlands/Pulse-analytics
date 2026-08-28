import { applyTheme, defaultTheme, readTheme, saveTheme, type ThemeId } from "./theme";

class Appearance {
    id = $state<ThemeId>(defaultTheme);

    hydrate() {
        this.id = readTheme() ?? defaultTheme;
        applyTheme(this.id);
    }

    set(id: ThemeId) {
        this.id = id;
        saveTheme(id);
    }

    toggle() {
        this.set(this.id === "signal" ? "observatory" : "signal");
    }
}

export const appearance = new Appearance();
