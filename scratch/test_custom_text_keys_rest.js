import fetch from 'node-fetch';

const SITE_ID = '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7';
const API_KEY = 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjg2NTkxYjBiLTAwNGUtNDRmMi05NGQ4LWJiNDEyMmYxNzE5ZVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjViMDJiNTQ3LWM3NTAtNDNmMS04YjlmLWFlNmVlY2ZiODY3MlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJkYjRmOTZkOC1lYjhhLTRhN2EtYmVjOS02MzA5YjEyMDNmODNcIn19IiwiaWF0IjoxNzgwODE4MTgyfQ.dFFNriVyZxY1FGkAVdycrLK8YE8qXiVjX54lh5z-2eEW0Hsa_4mR9vtycx5bGQmasWJP8zsAxL7WSIdFSEubEBWeZCbNhSlDUg2O5ejFQi6Id-usmpvTa-1XutoF4pTCyysWeptZXZQAgoY63u7LLzoNzNqNVzUSt6jLrvndqtZhpF1YZwJsIDfLRWw_Rt3qFRtKrtdGl8bBCeSEGdADIKKVlTep0lNsSRFAI-sXvzo3RdhjfMovkNszbG0fHS0wAAb-WHYIk6DC13myaKYaYnmWr8aS-sAx5hleIK4Vww0rDcMfc6MxkOD-3Xk84vYt-JGfFKUgIxCbhrSJDYMgKg';

const itemId = 'bcf7626f-9509-7151-8a1e-d7ce4c3c7cef';
const appId = '215238eb-22a5-4c36-9e7b-e7c08025e04e';
const tfTitle = "Bestille en spesiell sticker? Fortell oss hvilken!";
const tfValue = "Vilkårlig motiv";
const optName = "Choose Your Option";
const optVal = "Mystery Norsk/English Sticker";

async function runTest(label, payload) {
  const url = 'https://www.wixapis.com/ecom/v1/checkouts';
  const body = {
    lineItems: [payload],
    channelType: 'WEB'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': API_KEY,
        'wix-site-id': SITE_ID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    const itemsCount = data.checkout?.lineItems?.length || 0;
    if (itemsCount > 0) {
      console.log(`[SUCCESS] ${label} - added ${itemsCount} items!`);
      console.log('Result payload details:', JSON.stringify(data.checkout.lineItems, null, 2));
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
}

async function main() {
  const keys = [
    tfTitle,
    "Bestille en spesiell sticker? Fortell oss hvilken!",
    "0",
    "1",
    "customTextFields",
    "customTextField",
    "customTextFields[0]",
    "freeTextSettings",
    "text",
    "title",
    "note",
    "notes"
  ];

  console.log('Starting keys and structures testing...');

  for (const k of keys) {
    // Structure 1: customTextFields array with { freeTextSettings: { key: k }, value: tfValue }
    let success = await runTest(`customTextFields [ { freeTextSettings: { key: "${k}" }, value: tfValue } ]`, {
      catalogReference: {
        appId,
        catalogItemId: itemId,
        options: {
          options: { [optName]: optVal }
        },
        customTextFields: [
          {
            freeTextSettings: { key: k },
            value: tfValue
          }
        ]
      },
      quantity: 1
    });
    if (success) return;

    // Structure 2: customTextFields array with { title: k, value: tfValue }
    success = await runTest(`customTextFields [ { title: "${k}", value: tfValue } ]`, {
      catalogReference: {
        appId,
        catalogItemId: itemId,
        options: {
          options: { [optName]: optVal }
        },
        customTextFields: [
          {
            title: k,
            value: tfValue
          }
        ]
      },
      quantity: 1
    });
    if (success) return;

    // Structure 3: customTextFields map as { [k]: tfValue } inside catalogReference
    success = await runTest(`customTextFields map { "${k}": "${tfValue}" }`, {
      catalogReference: {
        appId,
        catalogItemId: itemId,
        options: {
          options: { [optName]: optVal }
        },
        customTextFields: {
          [k]: tfValue
        }
      },
      quantity: 1
    });
    if (success) return;

    // Structure 4: options.options with custom field key inside it
    success = await runTest(`options.options with key "${k}"`, {
      catalogReference: {
        appId,
        catalogItemId: itemId,
        options: {
          options: {
            [optName]: optVal,
            [k]: tfValue
          }
        }
      },
      quantity: 1
    });
    if (success) return;
  }

  console.log('All tests finished.');
}

main().catch(console.error);
