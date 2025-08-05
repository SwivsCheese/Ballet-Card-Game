import Card from "../classes/Card.js";

const dirtBlock = new Card(
  15,
  0,
  0,
  0,
  "Dirt Block",
  "/js/cards/images/block.webp",
  "If this Card reaches 0hp, you lose the game, defend it at all costs.",
  null
);

const dirtBlock1 = dirtBlock;

export default dirtBlock1;