const tf = require('@tensorflow/tfjs');

async function trainAndPredict(timeAndPriceData, newTimestamp) {
  // Extract timestamps and prices from the data
  const timestamps = timeAndPriceData.map(([timestamp, price]) => timestamp);
  const prices = timeAndPriceData.map(([timestamp, price]) => price);

  // Normalize and scale the data
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const normalizedTimestamps = timestamps.map(ts => (ts - minTimestamp) / (maxTimestamp - minTimestamp));
  const normalizedPrices = prices.map(price => (price - minPrice) / (maxPrice - minPrice));

  // Convert data to TensorFlow tensors
  const X = tf.tensor1d(normalizedTimestamps);
  const y = tf.tensor1d(normalizedPrices);

  // Create a simple linear regression model
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

  // Compile the model
  model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });

  // Train the model
  await model.fit(X, y, { epochs: 100 });

  // Normalize the new timestamp for prediction
  const normalizedNewTimestamp = (newTimestamp - minTimestamp) / (maxTimestamp - minTimestamp);

  // Predict the normalized price for the new timestamp
  const normalizedPredictedPrice =    model.predict(tf.tensor1d([normalizedNewTimestamp]));

  // Scale the predicted price back to the original range
  const predictedPrice = normalizedPredictedPrice.mul(maxPrice - minPrice).add(minPrice);

  return predictedPrice.dataSync()[0];
}

module.exports = trainAndPredict;

