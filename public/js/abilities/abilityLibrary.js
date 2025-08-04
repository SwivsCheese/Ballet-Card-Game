
const abilityLibrary = {
  shoot: {
    useAgainst: (card, target, gameContext) => {
      const { socket, room, actionsObj, animateUseOfCard, targetPassiveAbility, checkHealth } = gameContext;

      if(Number(card.getAttribute('data-mana')) < 1){
        console.log('not enough mana to shoot');
        return;
      }

      const cardPos = [Number(card.parentElement.id[0]), Number(card.parentElement.id[2])];
      const targetPos = [Number(target.parentElement.id[0]), Number(target.parentElement.id[2])];
      const rangeX = Math.abs(cardPos[0] - targetPos[0]);
      const rangeY = Math.abs(cardPos[1] - targetPos[1]);

      if(rangeX > card.getAttribute('data-abilityrange') || rangeY > card.getAttribute('data-abilityrange')){
        console.log('not in range to shoot');
        return;
      }

      if(actionsObj.abilities.includes(card.id)){
        console.log('cant shoot again');
        return;
      }

      const mana = card.getAttribute('data-mana') - 1;
      actionsObj.abilities.push(card.id);

      if(card.getAttribute('data-fogged') == 'true'){
        socket.emit('out-of-fog', { card: card.outerHTML, square: card.parentElement.id, roomid: room });
      }

      animateUseOfCard(card, target.firstChild);

      setTimeout(() => {
        const damage = Number(card.getAttribute('data-abilityattack'));
        const currentHealth = Number(target.firstChild.getAttribute('data-health'));
        const newHealth = currentHealth - damage;

        targetPassiveAbility(damage, target.firstChild);

        socket.emit('mana-card', { card: card.id, roomid: room, mana: mana });

        if(checkHealth(newHealth)){
          socket.emit('ability-remove', {
            attacker: card.id,
            attacked: target.firstChild.id,
            roomid: room
          });
          target.firstChild.remove();
          return;
        }

        target.firstChild.setAttribute("data-health", newHealth);
        socket.emit('ability-attack', {
          attacker: card.id,
          attacked: target.firstChild.id,
          health: newHealth,
          roomid: room
        });
      }, 550);

      if(card.getAttribute('data-fogged') == 'true'){
        setTimeout(() => {
          socket.emit('in-the-fog', { card: card.id, roomid: room });
        }, 300);
      }
    }
  },

  // More abilities can go here...
};

export default abilityLibrary;
