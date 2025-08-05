// 
import Card from "../classes/Card.js";

const bobm = new Card(
  5, //heath
  5, //attack
  0, //mana
  1, //movement
  "walking_bomb", //name
  "/js/cards/images/bobomb.webp", //img
  "If this card reaches the other end, it blows up a 3x3 radius for 5 damage. This card dies if it blows up",
  ["blow_up_reach_end"], // ability
  null,
  "attacker",
  5,
  0,

);

const robloxguy = new Card(
  4,
  2,
  1,
  2,
  "roblock",
  "/js/cards/images/roblock.webp",
  "This is a roblox guy",
  [null],
  null,
  "attacker",
  0,
  0,
);

const vyvanse = new Card(
  0,
  0,
  0,
  0,
  "Stimulant",
  "/js/cards/images/vyvanse.jpg",
  "This stimulant will make you faster, more precise, and really locked in",
  ["give_stim"], // ability
  null,
  "ability",
  1,
  0,
);

const gluer = new Card(
  0,
  0,
  0,
  0,
  "Sticky_Glue",
  "/js/cards/images/glue.jpg",
  "If your opponent steps in this, they will not be able to move this card for a turn",
  ["glue_square"],
  null,
  "ability",
  0,
  0
);

const cigarguy = new Card(
  4,
  6,
  0,
  1,
  "Cigar_Guy",
  "/js/cards/images/cigarguy.jpg",
  "This guy will smoke you",
  [null],
  null,
  "attacker",
  0,
  0,
);

const docholliday = new Card(
  3,
  2,
  5,
  1,
  "Doc_Holliday",
  "/js/cards/images/holiday.jpg",
  "He's got 5 shots in his revolver (uses mana)",
  ["shooting"],
  null,
  "attacker",
  2,
  2,
);

const gambler = new Card(
  2,
  2,
  0,
  1,
  "The_Gambler",
  "/js/cards/images/thegambler.jpg",
  "If this card is on the board, you are given the option to gamble for 2 or 0 cards",
  ["gamble_draw"],
  null,
  "attacker",
  0,
  0,

);

const grok = new Card(
  0,
  0,
  0,
  0,
  "grok",
  "/js/cards/images/gonk.png",
  "play this card to see your opponent's hand",
  ["show_enemy_hand"],
  null,
  "ability",
  0,
  0,
);

const Oil_Spill = new Card(
  0,
  0,
  0,
  0,
  "Oil_Spill",
  "/js/cards/images/oilspill.webp",
  "play this card to deploy all your available cards from your hand to the board",
  ["deploy_entire_hand"],
  null,
  "ability",
  0,
  0,

);

const wall = new Card(
  0,
  0,
  5,
  0,
  "wall",
  "/js/cards/images/walmart.webp",
  "this card creates a 3x1 wall",
  ["create_wall"],
  null,
  "tower",
  0,
  0,

);

const Sun = new Card(
  0,
  0,
  0,
  0,
  "The_Sun",
  "/js/cards/images/thesun.jpg",
  "give this card to another card to allow it to throw The_Sun. does 4 damage, need to be within 1 square range",
  ["attach_sun"],
  null,
  "attacher",
  4,
  1,

);

const funny_vest = new Card(
  0,
  0,
  0,
  0,
  "funny_vest",
  "/js/cards/images/bombadeer.png",
  "give this card to another card to allow it to blow up a 3x3 area for 4 damage. also gain +1 movement",
  ["attach_blow_up_vest"],
  null,
  "attacher",
  4,
  0,

);

const nuke = new Card(
  0,
  0,
  0,
  0,
  "nuke",
  "/js/cards/images/nuke.jpg",
  "2 turns from now, the nuke will drop in the middle of the board. leaves radiation for 1 turn",
  ["in_2_turns_drop_nuke"],
  null,
  "ability",
  5,
  0,

);

const JSN_ = new Card(
  5,
  2,
  0,
  2,
  "JSN_",
  "/js/cards/images/jsnCapture.png",
  "BLOW UP, MAN.",
  ["blow_up_man"],
  null,
  "attacker",
  4,
  0,

);

const mana_card = new Card(
  0,
  0,
  0,
  0,
  "mana_card",
  "/js/cards/images/estrogen.jpg",
  "give a card mana with this card",
  ["give_mana"],
  null,
  "ability",
  0,
  0,

);

const cactus_jack = new Card(
  4,
  2,
  0,
  1,
  "cactus_jack",
  "/js/cards/images/cactusjack.jpg",
  "cactus jack",
  [null],
  null,
  "attacker",
  0,
  0,

);

const draw_more = new Card(
  0,
  0,
  0,
  0,
  "draw_more",
  "/js/cards/images/draw4.webp",
  "draw 4 cards",
  ["draw_4_cards"],
  null,
  "ability",
  0,
  0,

);

const health_potion = new Card(
  0,
  0,
  0,
  0,
  "health_potion",
  "/js/cards/images/healthpot.png",
  "heal card for 3 health",
  ["give_health_potion"],
  null,
  "ability",
  0,
  0,

);

const bee_keeper = new Card(
  3,
  1,
  0,
  1,
  "bee_keeper",
  "/js/cards/images/beekeeper.png",
  "on death, spawn 3 bees adjacent to bee keeper",
  ["on_death_spawn_bees"],
  null,
  "attacker",
  0,
  0,

);

const seek_n_draw = new Card(
  0,
  0,
  0,
  0,
  "seek_n_draw",
  "/js/cards/images/seekndraw.png",
  "draw 6 cards and seek 2 from your deck",
  ["seek_and_draw"],
  null,
  "ability",
  0,
  0,
);

const bishop = new Card(
  3,
  2,
  0,
  3,
  "bishop",
  "/js/cards/images/popefrance.webp",
  "move 3 spaces, but only diagonally.",
  [null],
  null,
  "attacker",
  0,
  0,
);

const knocker = new Card(
  0,
  0,
  0,
  0,
  "knocker",
  "/js/cards/images/knocker.webp",
  "knocks an ability from a card's hands, that card is no longer able to use their ability.",
  ["knock_ability"],
  null,
  "ability",
  0,
  0,
);

const health_tower = new Card(
  0,
  0,
  3,
  0,
  "health_tower",
  "/js/cards/images/building.png",
  "every 2 turns, this tower will sap health from enemies near by it. if tower is destroyed, grass block loses 2hp. only placeable on your side of the board",
  ["on_tower_death", "place_tower"],
  null,
  "tower",
  2,
  0,
);

const necromancer = new Card(
  3,
  1,
  2,
  1,
  "necromancer",
  "/js/cards/images/necro.png",
  "this card can summon dead cards, and will place them at the top of your deck. the card uses 1 mana for each card summmoned.",
  ["summon_dead"],
  null,
  "attacker",
  0,
  0,
);

const harambe = new Card(
  5,
  2,
  0,
  1,
  "harambe",
  "/js/cards/images/harmbe.jpg",
  "for each point of damage taken, this card gains +1 attack",
  ["gain_attack_when_attacked"],
  null,
  "attacker",
  0,
  0,
);

const beenade = new Card(
  0,
  2,
  0,
  0,
  "beenade",
  "/js/cards/images/beenade.png",
  "the bees sting the opponent for 2 damage",
  ["attach_beenade"],
  null,
  "attacher",
  2,
  0,
);

const steal_card = new Card(
  0,
  0,
  0,
  0,
  "steal_card",
  "/js/cards/images/steal.webp",
  "steal 1 card from the opponent's hand",
  ["steal_card_from_opp"],
  null,
  "ability",
  0,
  0,
);

const drawer = new Card(
  3,
  1,
  0,
  1,
  "drawer",
  "/js/cards/images/drawer.jpg",
  "if you attack another card with this card, draw a card from your deck",
  ["on_attack_draw_1"],
  null,
  "attacker",
  0,
  0,
);

const wave = new Card(
  0,
  0,
  0,
  0,
  "wave",
  "/js/cards/images/wave.png",
  "push cards in a 3x2 area 2 squares back",
  ["push_back_cards"],
  null,
  "ability",
  0,
  0,
);

const fog_of_war = new Card(
  0,
  0,
  0,
  0,
  "fog_of_war",
  "/js/cards/images/fogofwar.png",
  "for 2 turns, your opponent doesn't see your cards on your side of the board.",
  ["fog_own_side_for_2_turns"],
  null,
  "ability",
  0,
  0,
);

const puller = new Card(
  4,
  1,
  0,
  1,
  "puller",
  "/js/cards/images/puller.png",
  "pulls a card next to this card",
  ["pull_card"],
  null,
  "attacker",
  0,
  2,
);

const bee = new Card(
  1,
  1,
  0,
  2,
  "bee",
  "/js/cards/images/bee.webp",
  "stings opponent for 1 damage",
  [null],
  null,
  "attacker",
  0,
  0,
  
);

// remember to fix gluer and fix it's code
let customDeckImport = [
  bobm, health_potion, robloxguy, nuke, vyvanse, funny_vest, Sun, cigarguy, bee_keeper,
  docholliday, gambler, grok, draw_more, cactus_jack, wall, mana_card, Oil_Spill, JSN_, draw_more,
  bishop, seek_n_draw, knocker, health_tower, necromancer, harambe, beenade, steal_card, drawer, wave,
  puller, puller, fog_of_war, seek_n_draw,seek_n_draw,seek_n_draw,seek_n_draw,seek_n_draw,seek_n_draw,
  steal_card, steal_card, steal_card, steal_card, necromancer, necromancer, necromancer, necromancer,
  necromancer, necromancer, necromancer, necromancer, necromancer, necromancer, necromancer
  
];

/*

*/

export default customDeckImport;