const SAVE_KEY = 'berry-ninja-save';

export const saveManager = {
    save(data) {
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    },

    load() {
        const saved = localStorage.getItem(SAVE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            selectedSkin: 'default',
            unlockedSkins: ['default'],
            highScore: 0,
            bladeColor: 0xFFFFFF
        };
    },

    unlockSkin(skinId) {
        const data = this.load();
        if (!data.unlockedSkins.includes(skinId)) {
            data.unlockedSkins.push(skinId);
            this.save(data);
        }
    },

    setSelectedSkin(skinId) {
        const data = this.load();
        data.selectedSkin = skinId;
        this.save(data);
    },

    updateHighScore(score) {
        const data = this.load();
        if (score > data.highScore) {
            data.highScore = score;
            this.save(data);
        }
        return data.highScore;
    },
    
    setBladeColor(color) {
        const data = this.load();
        data.bladeColor = color;
        this.save(data);
        return color;
    },
    
    getBladeColor() {
        const data = this.load();
        return data.bladeColor || 0xFFFFFF;
    }
}; 