'use strict';

const Article = require('./src/db/article');
const articles = require('masteringjs.io/src/tutorials');
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const mongoose = require('./mongoose');

dotenv.config();

run().catch(err => console.log(err));

async function run() {
  await mongoose.connect(process.env.ASTRA_URI, { isAstra: true });

  const $vector = await createEmbedding(`How do I reverse an array in JavaScript?`);
  const results = await Article
    .find()
    .setOptions({ $similarity: 1, title: 1, content: 1, url: 1 })
    .sort({ $vector: { $meta: $vector } })
    .limit(3);
  console.log(results.map(res => res.title));
}

function createEmbedding(input) {
  return axios({
    method: 'POST',
    url: 'https://api.openai.com/v1/embeddings',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    data: {
      model: 'text-embedding-ada-002',
      input
    }
  }).then(res => res.data.data[0].embedding);
};