// cardPool.js

import { calculateWeight, getSubTagWeights } from './tagManager.js';

let cardPool = [];

// Load card configuration from cards.json
fetch('config/cards.json')
  .then(response => response.json())
  .then(data => {
    console.warn('Card pool loaded.');
    cardPool = data;
    if (cardPool.length === 0) {
      console.warn('Warning: Card pool is empty.');
    }
  })
  .catch(error => {
    console.error('Error loading cards:', error);
  });

export function drawCard() {
  console.log('Function drawCard started');

  if (cardPool.length === 0) {
    console.error('Error: Card pool is empty.');
    return null;
  }

  const weights = cardPool.map(card => {
    const baseWeight = 1;//calculateWeight(card.baseTag);
    const subTagWeight = 1;//getSubTagWeights(card.baseTag);

    console.log(`Card: ${card.name}, Base Weight: ${baseWeight}, Sub Tag Weight: ${subTagWeight}`);

    return baseWeight + subTagWeight;
  });

  console.log('Weights calculated:', weights);

  const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
  console.log('Total Weight:', totalWeight);

  const random = Math.random() * totalWeight;
  console.log('Random number generated:', random);

  let cumulativeWeight = 0;
  for (let i = 0; i < cardPool.length; i++) {
    cumulativeWeight += weights[i];
    console.log(`Cumulative Weight at index ${i}:`, cumulativeWeight);

    if (random < cumulativeWeight) {
      console.log('Selected Card:', cardPool[i]);
      return cardPool[i];
    }
  }

  console.error('Error: This line should not be reached if weights are correctly calculated');
  return null;
}
