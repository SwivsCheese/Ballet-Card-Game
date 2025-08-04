
class Card{
  constructor(health, attack, mana, movement, name, image, description, ability, attatched, determiner, abilityAttack, abilityRange){
    this.health = health;
    this.attack = attack;
    this.mana = mana;
    this.movement = movement;
    this.name = name;
    this.image = image;
    this.description = description;
    this.ability = ability;
    this.attatched = attatched;
    this.determiner = determiner;
    this.abilityAttack = abilityAttack;
    this.abilityRange = abilityRange;
  }
  static fromObject(obj){
    return new Card(
      obj.health,
      obj.attack,
      obj.mana,
      obj.movement,
      obj.name,
      obj.image,
      obj.description,
      obj.ability,
      obj.attatched,
      obj.determiner,
      obj.abilityAttack,
      obj.abilityRange
    )
  }
}


export default Card;
