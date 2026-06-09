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
    if (!response.ok) {
      console.log(`[HTTP ERROR] ${label}: Status ${response.status} - ${data.message || JSON.stringify(data)}`);
      return false;
    }

    const itemsCount = data.checkout?.lineItems?.length || 0;
    if (itemsCount > 0) {
      console.log(`[SUCCESS] ${label} - added ${itemsCount} items!`);
      console.log('Result payload details:', JSON.stringify(data.checkout.lineItems, null, 2));
      return true;
    } else {
      console.log(`[FAILED] ${label} - lineItems is empty`);
      return false;
    }
  } catch (err) {
    console.log(`[EXCEPTION] ${label}: ${err.message}`);
    return false;
  }
}

async function main() {
  const tests = [
    {
      label: "Nest-01: descriptionLines at root with name.original & plainText.original",
      payload: {
        catalogReference: {
          appId,
          catalogItemId: itemId,
          options: {
            options: { [optName]: optVal }
          }
        },
        descriptionLines: [
          {
            name: { original: tfTitle },
            plainText: { original: tfValue }
          }
        ],
        quantity: 1
      }
    },
    {
      label: "Nest-02: descriptionLines inside catalogReference with name.original & plainText.original",
      payload: {
        catalogReference: {
          appId,
          catalogItemId: itemId,
          options: {
            options: { [optName]: optVal }
          },
          descriptionLines: [
            {
              name: { original: tfTitle },
              plainText: { original: tfValue }
            }
          ]
        },
        quantity: 1
      }
    },
    {
      label: "Nest-03: customTextFields at root with title.original & value.original",
      payload: {
        catalogReference: {
          appId,
          catalogItemId: itemId,
          options: {
            options: { [optName]: optVal }
          }
        },
        customTextFields: [
          {
            title: { original: tfTitle },
            value: { original: tfValue }
          }
        ],
        quantity: 1
      }
    },
    {
      label: "Nest-04: customTextFields inside catalogReference with title.original & value.original",
      payload: {
        catalogReference: {
          appId,
          catalogItemId: itemId,
          options: {
            options: { [optName]: optVal }
          },
          customTextFields: [
            {
              title: { original: tfTitle },
              value: { original: tfValue }
            }
          ]
        },
        quantity: 1
      }
    },
    {
      label: "Nest-05: customTextFields inside catalogReference with title (string) & value.original",
      payload: {
        catalogReference: {
          appId,
          catalogItemId: itemId,
          options: {
            options: { [optName]: optVal }
          },
          customTextFields: [
            {
              title: tfTitle,
              value: { original: tfValue }
            }
          ]
        },
        quantity: 1
      }
    },
    {
      label: "Nest-06: descriptionLines at root with name.original & value.original",
      payload: {
        catalogReference: {
          appId,
          catalogItemId: itemId,
          options: {
            options: { [optName]: optVal }
          }
        },
        descriptionLines: [
          {
            name: { original: tfTitle },
            value: { original: tfValue }
          }
        ],
        quantity: 1
      }
    }
  ];

  console.log(`Starting ${tests.length} nested object tests...`);
  for (const t of tests) {
    const success = await runTest(t.label, t.payload);
    if (success) {
      console.log('SUCCESS FOUND!');
      return;
    }
  }
  console.log('All tests finished.');
}

main().catch(console.error);
