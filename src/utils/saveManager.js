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
        // Make sure color is a number
        if (typeof color === 'string') {
            color = parseInt(color, 16);
        }
        
        // Ensure we have a valid color
        if (isNaN(color) || color < 0) {
            color = 0xFFFFFF; // Default to white if invalid
        }
        
        const data = this.load();
        data.bladeColor = color;
        
        // Log to confirm color is being saved correctly
        console.log("Saving blade color:", color, "typeof:", typeof color);
        
        this.save(data);
        return color;
    },
    
    getBladeColor() {
        const data = this.load();
        let color = data.bladeColor;
        
        // Make sure color is a number
        if (typeof color === 'string') {
            color = parseInt(color, 16);
        }
        
        // Ensure we have a valid color
        if (isNaN(color) || color < 0) {
            color = 0xFFFFFF; // Default to white if invalid
        }
        
        // Log to confirm color is being loaded correctly
        console.log("Loading blade color:", color, "typeof:", typeof color);
        
        return color;
    }
}; 