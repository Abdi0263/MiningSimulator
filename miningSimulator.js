const gameData = {
  money: 0,
  luckLevel: 0,
  luckChance: 0, // luck % chance to get better ores, depends on luckLevel
  boostMultiplier: 1, // from codes
  boostTimeout: null,
  resources: [
    { tier: 1, name: "Stone", value: 1 },
    { tier: 2, name: "Dirt Chunk", value: 2 },
    { tier: 3, name: "Coal", value: 5 },
    { tier: 4, name: "Sand Crystal", value: 10 },
    { tier: 5, name: "Copper", value: 20 },
    { tier: 6, name: "Iron", value: 50 },
    { tier: 7, name: "Tin", value: 100 },
    { tier: 8, name: "Aluminum", value: 200 },
    { tier: 9, name: "Silver", value: 500 },
    { tier: 10, name: "Gold", value: 1000 },
    { tier: 11, name: "Platinum", value: 2500 },
    { tier: 12, name: "Titanium", value: 5000 },
    { tier: 13, name: "Uranium", value: 10000 },
    { tier: 14, name: "Emerald", value: 20000 },
    { tier: 15, name: "Ruby", value: 40000 },
    { tier: 16, name: "Sapphire", value: 75000 },
    { tier: 17, name: "Diamond", value: 150000 },
    { tier: 18, name: "Obsidian Shard", value: 300000 },
    { tier: 19, name: "Mythril", value: 500000 },
    { tier: 20, name: "Adamantium", value: 1000000 },
    { tier: 21, name: "Void Crystal", value: 2000000 },
    { tier: 22, name: "Dragonstone", value: 5000000 },
    { tier: 23, name: "Phoenix Ore", value: 10000000 },
    { tier: 24, name: "Starsteel", value: 20000000 },
    { tier: 25, name: "Nova Fragment", value: 35000000 },
    { tier: 26, name: "Dark Matter", value: 50000000 },
    { tier: 27, name: "Quantum Alloy", value: 75000000 },
    { tier: 28, name: "Antimatter Core", value: 100000000 },
    { tier: 29, name: "Celestium", value: 250000000 },
    { tier: 30, name: "Eternium", value: 500000000 },
    { tier: 31, name: "Chrono Dust", value: 1000000000 },
    { tier: 32, name: "Godshard", value: 5000000000 },
    { tier: 33, name: "Soul Crystal", value: 10000000000 },
    { tier: 34, name: "Infinity Core", value: 50000000000 },
    { tier: 35, name: "Omega Singularity", value: 100000000000 },
  ],
  inventory: {}, // key: resource name, value: amount mined
  secretResource: { name: "Secret Fruit", value: 99990000000000 },
  secretFound: false
};

// Initialize inventory counts to zero
gameData.resources.forEach(r => gameData.inventory[r.name] = 0);

// --- Functions ---

// Get random integer in range [min, max]
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Calculate luck chance based on luckLevel
function updateLuckChance() {
  // For example luckLevel 1 = 5% better ore chance, etc.
  gameData.luckChance = gameData.luckLevel * 5;
}

// Mine resources - returns object with mined resource and amount
function mine() {
  // Base tier: randomly from 1 to 10 (adjustable)
  const baseMaxTier = 10;

  // Roll luck for better ores
  let tierRoll = randomInt(1, baseMaxTier);

  // Luck can upgrade tierRoll with some chance
  if (Math.random() < gameData.luckChance / 100) {
    // Upgrade tier roll by 1 to 5 levels (random)
    tierRoll += randomInt(1, 5);
  }

  // Cap tierRoll to max tier
  if (tierRoll > gameData.resources.length) tierRoll = gameData.resources.length;

  // Secret resource chance (very low 0.01%)
  if (!gameData.secretFound && Math.random() < 0.0001) {
    gameData.secretFound = true;
    gameData.inventory[gameData.secretResource.name] = 1;
    return { resource: gameData.secretResource, amount: 1, secret: true };
  }

  // Find resource by tierRoll
  const resource = gameData.resources.find(r => r.tier === tierRoll);

  // Random amount mined: between 10 to 50
  const amount = randomInt(10, 50);

  // Add to inventory
  gameData.inventory[resource.name] += amount;

  return { resource, amount };
}

// Sell all resources in inventory, returns total money earned
function sellAll() {
  let total = 0;
  for (const [name, amount] of Object.entries(gameData.inventory)) {
    if (amount > 0) {
      let value = 0;
      if (name === gameData.secretResource.name) {
        value = gameData.secretResource.value * amount;
      } else {
        const res = gameData.resources.find(r => r.name === name);
        if (res) value = res.value * amount;
      }
      total += value;
      gameData.inventory[name] = 0;
    }
  }
  total *= gameData.boostMultiplier; // apply boost
  gameData.money += total;
  return total;
}

// Buy luck upgrade
function buyLuckUpgrade() {
  const cost = 1000;
  if (gameData.money >= cost) {
    gameData.money -= cost;
    gameData.luckLevel++;
    updateLuckChance();
    return true;
  }
  return false;
}

// Codes system
const codes = {
  "Release": () => {
    // 5 min boost: selling gives x700 money
    gameData.boostMultiplier = 700;
    if (gameData.boostTimeout) clearTimeout(gameData.boostTimeout);
    gameData.boostTimeout = setTimeout(() => {
      gameData.boostMultiplier = 1;
    }, 5 * 60 * 1000);
    return "Release code activated! Selling boosted x700 for 5 minutes.";
  },
  "Update v1": () => {
    gameData.money += 1000;
    return "Update v1 code activated! You got $1,000.";
  },
  "Food": () => {
    // Gives 1 luck upgrade free if you have none
    if (gameData.luckLevel < 1) {
      gameData.luckLevel = 1;
      updateLuckChance();
      return "Food code activated! Luck upgrade level 1 granted.";
    }
    return "Food code already used or you have luck upgrades.";
  },
  "Moneytalks": () => {
    // 2% chance to get secret fruit instantly & plays song
    if (Math.random() < 0.02) {
      gameData.secretFound = true;
      gameData.inventory[gameData.secretResource.name] = 1;
      // For sound playing you have to handle in your UI environment
      return "Moneytalks code success! Secret Fruit obtained! 🎵 Play the song now.";
    }
    return "Moneytalks code used but no secret fruit this time.";
  }
};

// Example usage: mine(), sellAll(), buyLuckUpgrade(), applyCode("Release")

// Export gameData and functions if module
if (typeof window !== "undefined") {
  window.miningSim = {
    gameData,
    mine,
    sellAll,
    buyLuckUpgrade,
    applyCode: code => {
      if (codes[code]) return codes[code]();
      return "Invalid code.";
    }
  };
}

// Variables to track state
money = 0
inventory = { rareStone: 0, ... }
upgrades = { upgrade1: false, ... }
sellPriceNormal = 100  // example normal sell price
sellPriceBoost = 700
sellPriceCurrent = sellPriceNormal
boostActive = false
boostTimer = 0

function enterCode(code) {
    switch(code.toLowerCase()) {

        case "release":
            if (!boostActive) {
                boostActive = true
                sellPriceCurrent = sellPriceBoost
                boostTimer = 5 * 60  // 5 minutes in seconds
                print("Boost activated! Selling now gives 700 money for 5 minutes.")
            } else {
                print("Boost already active.")
            }
            break

        case "update v1":
            money += 1000
            print("You received 1000 money!")
            break

        case "food":
            if (!upgrades.upgrade1) {
                upgrades.upgrade1 = true
                applyUpgrade1()
                print("Upgrade #1 applied for free!")
            } else {
                print("You already have Upgrade #1.")
            }
            break

        case "moneytalks":
            playMusicSegment("https://www.youtube.com/watch?v=tg2amSq9OZk", 16)
            if (random(1, 100) <= 2) {
                inventory.rareStone += 1
                print("Lucky! You got the rarest stone!")
            } else {
                print("No luck this time.")
            }
            break

        default:
            print("Invalid code.")
    }
}

// This function runs every second (or frame) to update boost timer
function updateTimer(deltaTime) {
    if (boostActive) {
        boostTimer -= deltaTime
        if (boostTimer <= 0) {
            boostActive = false
            sellPriceCurrent = sellPriceNormal
            print("Boost ended. Selling price back to normal.")
        }
    }
}

// Example function for applying Upgrade #1
function applyUpgrade1() {
    // Example: Increase mining speed or allow better ores
    // Implement your upgrade logic here
}

// Function to play music for a specific duration
function playMusicSegment(url, seconds) {
    // Embed audio player, start playing the song at url
    // Stop the music after "seconds"
    // Implementation depends on your platform
}

// Function to simulate random number generation
function random(min, max) {
    // Return a random integer between min and max inclusive
}

// Function to print messages on screen or console
function print(message) {
    // Display message to player
}