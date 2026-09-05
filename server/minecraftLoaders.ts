export type MinecraftLoader = 
  | 'vanilla'
  | 'paper'
  | 'purpur'
  | 'fabric'
  | 'forge'
  | 'neoforge'
  | 'pufferfish'
  | 'folia'
  | 'sponge'
  | 'spigot'
  | 'quilt';

export interface LoaderInfo {
  id: MinecraftLoader;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  iconName: string;
  accentColor: string;
  isPluginCompatible: boolean;
  isModCompatible: boolean;
  recommended: boolean;
  officialSite: string;
}

export const MINECRAFT_LOADERS: LoaderInfo[] = [
  {
    id: 'paper',
    name: 'Paper',
    badge: 'High Performance',
    tagline: 'The most popular high-performance Minecraft server fork',
    description: 'Designed to greatly improve performance and offer advanced game-play tweaks while maintaining Bukkit/Spigot plugin compatibility.',
    iconName: 'Scroll',
    accentColor: '#ef4444',
    isPluginCompatible: true,
    isModCompatible: false,
    recommended: true,
    officialSite: 'https://papermc.io/software/paper',
  },
  {
    id: 'purpur',
    name: 'Purpur',
    badge: 'Maximum Optimization',
    tagline: 'Drop-in replacement for Paper with immense configuration',
    description: 'Extends Paper and Pufferfish with hundreds of new gameplay options, creature riding tweaks, custom performance optimizations, and full Spigot compatibility.',
    iconName: 'Zap',
    accentColor: '#a855f7',
    isPluginCompatible: true,
    isModCompatible: false,
    recommended: true,
    officialSite: 'https://purpurmc.org',
  },
  {
    id: 'fabric',
    name: 'Fabric',
    badge: 'Lightweight Modding',
    tagline: 'Modern, modular, and lightning-fast modding toolchain',
    description: 'Offers ultra-lightweight modding capabilities, rapid update release support, and massive performance mods like Lithium and FerriteCore.',
    iconName: 'Layers',
    accentColor: '#06b6d4',
    isPluginCompatible: false,
    isModCompatible: true,
    recommended: true,
    officialSite: 'https://fabricmc.net',
  },
  {
    id: 'forge',
    name: 'Forge',
    badge: 'Classic Modpacks',
    tagline: 'The legendary Minecraft modding platform',
    description: 'Powering thousands of the most popular complex modpacks, tech trees, magic mods, and dimensions across all classic and modern versions.',
    iconName: 'Hammer',
    accentColor: '#d97706',
    isPluginCompatible: false,
    isModCompatible: true,
    recommended: false,
    officialSite: 'https://minecraftforge.net',
  },
  {
    id: 'neoforge',
    name: 'NeoForge',
    badge: 'Next-Gen Modding',
    tagline: 'Modernized community-driven Forge evolution',
    description: 'The contemporary community-driven modding framework built for modern Minecraft 1.20.2+ and beyond with clean APIs and faster loading.',
    iconName: 'Flame',
    accentColor: '#f97316',
    isPluginCompatible: false,
    isModCompatible: true,
    recommended: true,
    officialSite: 'https://neoforged.net',
  },
  {
    id: 'vanilla',
    name: 'Vanilla',
    badge: 'Original Mojang',
    tagline: 'Standard unmodded Minecraft server from Mojang',
    description: 'The pure, unmodified official server software directly from Mojang Studios. Zero modifications, pure default survival experience.',
    iconName: 'Box',
    accentColor: '#22c55e',
    isPluginCompatible: false,
    isModCompatible: false,
    recommended: false,
    officialSite: 'https://www.minecraft.net',
  },
  {
    id: 'folia',
    name: 'Folia',
    badge: 'Multi-Threaded',
    tagline: 'Regionized multi-threading server for massive player bases',
    description: 'Paper fork that splits world ticks across multiple CPU threads by region, allowing hundreds of players on a single dedicated server.',
    iconName: 'Cpu',
    accentColor: '#10b981',
    isPluginCompatible: true,
    isModCompatible: false,
    recommended: false,
    officialSite: 'https://papermc.io/software/folia',
  },
  {
    id: 'pufferfish',
    name: 'Pufferfish',
    badge: 'Enterprise Speed',
    tagline: 'Ultra-high performance Paper fork designed for large networks',
    description: 'Custom SIMD optimizations and asynchronous game mechanics designed to push tick rates to the absolute limit under extreme entity loads.',
    iconName: 'Gauge',
    accentColor: '#3b82f6',
    isPluginCompatible: true,
    isModCompatible: false,
    recommended: false,
    officialSite: 'https://pufferfish.host',
  },
  {
    id: 'sponge',
    name: 'Sponge',
    badge: 'SpongeVanilla',
    tagline: 'Powerful modular plugin platform with advanced permission APIs',
    description: 'Provides flexible API designed to enrich server mechanics with robust plugin systems and cross-version stability.',
    iconName: 'Compass',
    accentColor: '#eab308',
    isPluginCompatible: true,
    isModCompatible: false,
    recommended: false,
    officialSite: 'https://spongepowered.org',
  },
  {
    id: 'spigot',
    name: 'Spigot',
    badge: 'Standard Bukkit',
    tagline: 'Classic CraftBukkit modified server software',
    description: 'The standard server software that introduced modern Bukkit plugin ecosystems and anti-xray capabilities.',
    iconName: 'Wrench',
    accentColor: '#f59e0b',
    isPluginCompatible: true,
    isModCompatible: false,
    recommended: false,
    officialSite: 'https://spigotmc.org',
  },
  {
    id: 'quilt',
    name: 'Quilt',
    badge: 'Community Modding',
    tagline: 'Modern, modular mod toolchain built with developer freedom',
    description: 'Forward-looking mod loader with complete Fabric mod compatibility plus extended standard libraries for developers.',
    iconName: 'Sparkles',
    accentColor: '#ec4899',
    isPluginCompatible: false,
    isModCompatible: true,
    recommended: false,
    officialSite: 'https://quiltmc.org',
  },
];

export interface MinecraftVersionItem {
  version: string;
  releaseCategory: 'latest' | 'modern' | 'stable' | 'classic';
  releaseDate: string;
  recommendedJava: 'Java 21' | 'Java 17' | 'Java 11' | 'Java 8';
  isSnapshot?: boolean;
  supportedLoaders: MinecraftLoader[];
}

// Complete list of official stable Minecraft releases from 1.12.2 to 1.21.4
export const ALL_MINECRAFT_VERSIONS: MinecraftVersionItem[] = [
  // 1.21 Series (Tricky Trials)
  {
    version: '1.21.4',
    releaseCategory: 'latest',
    releaseDate: 'Dec 2024',
    recommendedJava: 'Java 21',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'neoforge', 'pufferfish', 'folia', 'spigot', 'quilt'],
  },
  {
    version: '1.21.3',
    releaseCategory: 'latest',
    releaseDate: 'Oct 2024',
    recommendedJava: 'Java 21',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'neoforge', 'folia', 'spigot', 'quilt'],
  },
  {
    version: '1.21.2',
    releaseCategory: 'latest',
    releaseDate: 'Oct 2024',
    recommendedJava: 'Java 21',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'neoforge', 'folia', 'spigot', 'quilt'],
  },
  {
    version: '1.21.1',
    releaseCategory: 'latest',
    releaseDate: 'Aug 2024',
    recommendedJava: 'Java 21',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'neoforge', 'pufferfish', 'folia', 'spigot', 'quilt', 'sponge'],
  },
  {
    version: '1.21',
    releaseCategory: 'latest',
    releaseDate: 'Jun 2024',
    recommendedJava: 'Java 21',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'neoforge', 'pufferfish', 'folia', 'spigot', 'quilt'],
  },

  // 1.20 Series (Trails & Tales)
  {
    version: '1.20.6',
    releaseCategory: 'modern',
    releaseDate: 'Apr 2024',
    recommendedJava: 'Java 21',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'neoforge', 'folia', 'spigot', 'quilt'],
  },
  {
    version: '1.20.5',
    releaseCategory: 'modern',
    releaseDate: 'Apr 2024',
    recommendedJava: 'Java 21',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'neoforge', 'folia', 'spigot', 'quilt'],
  },
  {
    version: '1.20.4',
    releaseCategory: 'modern',
    releaseDate: 'Dec 2023',
    recommendedJava: 'Java 17',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'forge', 'neoforge', 'pufferfish', 'folia', 'spigot', 'quilt', 'sponge'],
  },
  {
    version: '1.20.3',
    releaseCategory: 'modern',
    releaseDate: 'Dec 2023',
    recommendedJava: 'Java 17',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'forge', 'neoforge', 'folia', 'spigot', 'quilt'],
  },
  {
    version: '1.20.2',
    releaseCategory: 'modern',
    releaseDate: 'Sep 2023',
    recommendedJava: 'Java 17',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'forge', 'neoforge', 'folia', 'spigot', 'quilt'],
  },
  {
    version: '1.20.1',
    releaseCategory: 'modern',
    releaseDate: 'Jun 2023',
    recommendedJava: 'Java 17',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'forge', 'pufferfish', 'folia', 'spigot', 'quilt', 'sponge'],
  },
  {
    version: '1.20',
    releaseCategory: 'modern',
    releaseDate: 'Jun 2023',
    recommendedJava: 'Java 17',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'forge', 'spigot', 'quilt'],
  },

  // 1.19 Series (The Wild Update)
  {
    version: '1.19.4',
    releaseCategory: 'modern',
    releaseDate: 'Mar 2023',
    recommendedJava: 'Java 17',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'forge', 'pufferfish', 'folia', 'spigot', 'quilt', 'sponge'],
  },
  {
    version: '1.19.3',
    releaseCategory: 'modern',
    releaseDate: 'Dec 2022',
    recommendedJava: 'Java 17',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'forge', 'spigot', 'quilt'],
  },
  {
    version: '1.19.2',
    releaseCategory: 'modern',
    releaseDate: 'Aug 2022',
    recommendedJava: 'Java 17',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'forge', 'pufferfish', 'spigot', 'quilt', 'sponge'],
  },
  {
    version: '1.19.1',
    releaseCategory: 'modern',
    releaseDate: 'Jul 2022',
    recommendedJava: 'Java 17',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'forge', 'spigot', 'quilt'],
  },
  {
    version: '1.19',
    releaseCategory: 'modern',
    releaseDate: 'Jun 2022',
    recommendedJava: 'Java 17',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'forge', 'spigot', 'quilt'],
  },

  // 1.18 Series (Caves & Cliffs Part II)
  {
    version: '1.18.2',
    releaseCategory: 'stable',
    releaseDate: 'Feb 2022',
    recommendedJava: 'Java 17',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'forge', 'pufferfish', 'spigot', 'quilt', 'sponge'],
  },
  {
    version: '1.18.1',
    releaseCategory: 'stable',
    releaseDate: 'Dec 2021',
    recommendedJava: 'Java 17',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'forge', 'spigot', 'quilt'],
  },
  {
    version: '1.18',
    releaseCategory: 'stable',
    releaseDate: 'Nov 2021',
    recommendedJava: 'Java 17',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'forge', 'spigot', 'quilt'],
  },

  // 1.17 Series (Caves & Cliffs Part I)
  {
    version: '1.17.1',
    releaseCategory: 'stable',
    releaseDate: 'Jul 2021',
    recommendedJava: 'Java 17',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'forge', 'pufferfish', 'spigot', 'quilt'],
  },
  {
    version: '1.17',
    releaseCategory: 'stable',
    releaseDate: 'Jun 2021',
    recommendedJava: 'Java 17',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'forge', 'spigot', 'quilt'],
  },

  // 1.16 Series (Nether Update)
  {
    version: '1.16.5',
    releaseCategory: 'stable',
    releaseDate: 'Jan 2021',
    recommendedJava: 'Java 11',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'forge', 'pufferfish', 'spigot', 'quilt', 'sponge'],
  },
  {
    version: '1.16.4',
    releaseCategory: 'stable',
    releaseDate: 'Nov 2020',
    recommendedJava: 'Java 11',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'forge', 'spigot'],
  },
  {
    version: '1.16.3',
    releaseCategory: 'stable',
    releaseDate: 'Sep 2020',
    recommendedJava: 'Java 11',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'forge', 'spigot'],
  },
  {
    version: '1.16.2',
    releaseCategory: 'stable',
    releaseDate: 'Aug 2020',
    recommendedJava: 'Java 11',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'forge', 'spigot'],
  },
  {
    version: '1.16.1',
    releaseCategory: 'stable',
    releaseDate: 'Jun 2020',
    recommendedJava: 'Java 11',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'forge', 'spigot'],
  },
  {
    version: '1.16',
    releaseCategory: 'stable',
    releaseDate: 'Jun 2020',
    recommendedJava: 'Java 11',
    supportedLoaders: ['vanilla', 'paper', 'purpur', 'fabric', 'forge', 'spigot'],
  },

  // 1.15 Series (Buzzy Bees)
  {
    version: '1.15.2',
    releaseCategory: 'classic',
    releaseDate: 'Jan 2020',
    recommendedJava: 'Java 8',
    supportedLoaders: ['vanilla', 'paper', 'fabric', 'forge', 'spigot'],
  },
  {
    version: '1.15.1',
    releaseCategory: 'classic',
    releaseDate: 'Dec 2019',
    recommendedJava: 'Java 8',
    supportedLoaders: ['vanilla', 'paper', 'fabric', 'forge', 'spigot'],
  },
  {
    version: '1.15',
    releaseCategory: 'classic',
    releaseDate: 'Dec 2019',
    recommendedJava: 'Java 8',
    supportedLoaders: ['vanilla', 'paper', 'fabric', 'forge', 'spigot'],
  },

  // 1.14 Series (Village & Pillage)
  {
    version: '1.14.4',
    releaseCategory: 'classic',
    releaseDate: 'Jul 2019',
    recommendedJava: 'Java 8',
    supportedLoaders: ['vanilla', 'paper', 'fabric', 'forge', 'spigot'],
  },
  {
    version: '1.14.3',
    releaseCategory: 'classic',
    releaseDate: 'Jun 2019',
    recommendedJava: 'Java 8',
    supportedLoaders: ['vanilla', 'paper', 'fabric', 'forge', 'spigot'],
  },
  {
    version: '1.14.2',
    releaseCategory: 'classic',
    releaseDate: 'May 2019',
    recommendedJava: 'Java 8',
    supportedLoaders: ['vanilla', 'paper', 'fabric', 'forge', 'spigot'],
  },
  {
    version: '1.14.1',
    releaseCategory: 'classic',
    releaseDate: 'May 2019',
    recommendedJava: 'Java 8',
    supportedLoaders: ['vanilla', 'paper', 'fabric', 'forge', 'spigot'],
  },
  {
    version: '1.14',
    releaseCategory: 'classic',
    releaseDate: 'Apr 2019',
    recommendedJava: 'Java 8',
    supportedLoaders: ['vanilla', 'paper', 'fabric', 'forge', 'spigot'],
  },

  // 1.13 Series (Update Aquatic)
  {
    version: '1.13.2',
    releaseCategory: 'classic',
    releaseDate: 'Oct 2018',
    recommendedJava: 'Java 8',
    supportedLoaders: ['vanilla', 'paper', 'forge', 'spigot'],
  },
  {
    version: '1.13.1',
    releaseCategory: 'classic',
    releaseDate: 'Aug 2018',
    recommendedJava: 'Java 8',
    supportedLoaders: ['vanilla', 'paper', 'forge', 'spigot'],
  },
  {
    version: '1.13',
    releaseCategory: 'classic',
    releaseDate: 'Jul 2018',
    recommendedJava: 'Java 8',
    supportedLoaders: ['vanilla', 'paper', 'forge', 'spigot'],
  },

  // 1.12 Series (World of Color)
  {
    version: '1.12.2',
    releaseCategory: 'classic',
    releaseDate: 'Sep 2017',
    recommendedJava: 'Java 8',
    supportedLoaders: ['vanilla', 'paper', 'forge', 'spigot', 'sponge'],
  },
];
