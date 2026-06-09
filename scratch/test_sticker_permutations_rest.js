import fetch from 'node-fetch';

const SITE_ID = '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7';
const API_KEY = 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjg2NTkxYjBiLTAwNGUtNDRmMi05NGQ4LWJiNDEyMmYxNzE5ZVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjViMDJiNTQ3LWM3NTAtNDNmMS04YjlmLWFlNmVlY2ZiODY3MlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJkYjRmOTZkOC1lYjhhLTRhN2EtYmVjOS02MzA5YjEyMDNmODNcIn19IiwiaWF0IjoxNzgwODE4MTgyfQ.dFFNriVyZxY1FGkAVdycrLK8YE8qXiVjX54lh5z-2eEW0Hsa_4mR9vtycx5bGQmasWJP8zsAxL7WSIdFSEubEBWeZCbNhSlDUg2O5ejFQi6Id-usmpvTa-1XutoF4pTCyysWeptZXZQAgoY63u7LLzoNzNqNVzUSt6jLrvndqtZhpF1YZwJsIDfLRWw_Rt3qFRtKrtdGl8bBCeSEGdADIKKVlTep0lNsSRFAI-sXvzo3RdhjfMovkNszbG0fHS0wAAb-WHYIk6DC13myaKYaYnmWr8aS-sAx5hleIK4Vww0rDcMfc6MxkOD-3Xk84vYt-JGfFKUgIxCbhrSJDYMgKg';

const itemId = 'bcf7626f-9509-7151-8a1e-d7ce4c3c7cef';
const appId = '215238eb-22a5-4c36-9e7b-e7c08025e04e';
const tfTitle = "Bestille en spesiell sticker? Fortell oss hvilken!";
const tfValue = "Vilkårlig motiv";
const optName = "Choose Your Option";
const optVal = "Mystery Norsk/English Sticker";

async function runTest(label, lineItemPayload) {
  const url = 'https://www.wixapis.com/ecom/v1/checkouts';
  const body = {
    lineItems: [lineItemPayload],
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
      label: "1. Options nested in options.options + customTextFields inside catalogReference",
      payload: {
        catalogReference: {
          appId,
          catalogItemId: itemId,
          options: {
            options: { [optName]: optVal }
          },
          customTextFields: [
            { title: tfTitle, value: tfValue }
          ]
        },
        quantity: 1
      }
    },
    {
      label: "2. Options nested in options.options + customTextFields at lineItem root",
      payload: {
        catalogReference: {
          appId,
          catalogItemId: itemId,
          options: {
            options: { [optName]: optVal }
          }
        },
        customTextFields: [
          { title: tfTitle, value: tfValue }
        ],
        quantity: 1
      }
    },
    {
      label: "3. Options flat inside options + customTextFields inside catalogReference",
      payload: {
        catalogReference: {
          appId,
          catalogItemId: itemId,
          options: {
            [optName]: optVal
          },
          customTextFields: [
            { title: tfTitle, value: tfValue }
          ]
        },
        quantity: 1
      }
    },
    {
      label: "4. Options flat inside options + customTextFields at lineItem root",
      payload: {
        catalogReference: {
          appId,
          catalogItemId: itemId,
          options: {
            [optName]: optVal
          }
        },
        customTextFields: [
          { title: tfTitle, value: tfValue }
        ],
        quantity: 1
      }
    },
    {
      label: "5. variantId + options.options + customTextFields inside",
      payload: {
        catalogReference: {
          appId,
          catalogItemId: itemId,
          options: {
            variantId: "00000000-0000-0000-0000-000000000000",
            options: { [optName]: optVal }
          },
          customTextFields: [
            { title: tfTitle, value: tfValue }
          ]
        },
        quantity: 1
      }
    },
    {
      label: "6. variantId flat at options + customTextFields inside",
      payload: {
        catalogReference: {
          appId,
          catalogItemId: itemId,
          options: {
            variantId: "00000000-0000-0000-0000-000000000000",
            [optName]: optVal
          },
          customTextFields: [
            { title: tfTitle, value: tfValue }
          ]
        },
        quantity: 1
      }
    },
    {
      label: "7. options.options + customTextFields with key instead of title",
      payload: {
        catalogReference: {
          appId,
          catalogItemId: itemId,
          options: {
            options: { [optName]: optVal }
          },
          customTextFields: [
            { key: tfTitle, value: tfValue }
          ]
        },
        quantity: 1
      }
    },
    {
      label: "8. options.options + customTextFields with freeTextSettings.value inside",
      payload: {
        catalogReference: {
          appId,
          catalogItemId: itemId,
          options: {
            options: { [optName]: optVal }
          },
          customTextFields: [
            { title: tfTitle, freeTextSettings: { value: tfValue } }
          ]
        },
        quantity: 1
      }
    },
    {
      label: "9. options.options + customTextFields with freeTextSettings.text inside",
      payload: {
        catalogReference: {
          appId,
          catalogItemId: itemId,
          options: {
            options: { [optName]: optVal }
          },
          customTextFields: [
            { title: tfTitle, freeTextSettings: { text: tfValue } }
          ]
        },
        quantity: 1
      }
    },
    {
      label: "10. options.options + customTextFields with text instead of value",
      payload: {
        catalogReference: {
          appId,
          catalogItemId: itemId,
          options: {
            options: { [optName]: optVal }
          },
          customTextFields: [
            { title: tfTitle, text: tfValue }
          ]
        },
        quantity: 1
      }
    },
    {
      label: "11. choices instead of options + customTextFields inside",
      payload: {
        catalogReference: {
          appId,
          catalogItemId: itemId,
          options: {
            choices: { [optName]: optVal }
          },
          customTextFields: [
            { title: tfTitle, value: tfValue }
          ]
        },
        quantity: 1
      }
    },
    {
      label: "12. options.choices + customTextFields inside",
      payload: {
        catalogReference: {
          appId,
          catalogItemId: itemId,
          options: {
            options: {
              choices: { [optName]: optVal }
            }
          },
          customTextFields: [
            { title: tfTitle, value: tfValue }
          ]
        },
        quantity: 1
      }
    },
    {
      label: "13. DescriptionLines at lineItem root + options.options",
      payload: {
        catalogReference: {
          appId,
          catalogItemId: itemId,
          options: {
            options: { [optName]: optVal }
          }
        },
        descriptionLines: [
          { name: tfTitle, value: tfValue }
        ],
        quantity: 1
      }
    },
    {
      label: "14. DescriptionLines inside catalogReference + options.options",
      payload: {
        catalogReference: {
          appId,
          catalogItemId: itemId,
          options: {
            options: { [optName]: optVal }
          },
          descriptionLines: [
            { name: tfTitle, value: tfValue }
          ]
        },
        quantity: 1
      }
    }
  ];

  console.log(`Starting ${tests.length} permutation tests on REST Checkouts API...`);
  for (const t of tests) {
    const success = await runTest(t.label, t.payload);
    if (success) {
      console.log('SUCCESS FOUND! Stopping tests.');
      return;
    }
  }
  console.log('All tests finished.');
}

main().catch(console.error);
