import { getTranslatedProduct } from '../src/lib/productTranslations.js';

const mockProducts = [
  {
    id: '027df813-8857-46d2-a2b2-38ed743335e8',
    name: 'FAITH OVER FEAR - White 11oz Ceramic Mug',
    description: 'If you have faith like a mustard seed... This beautiful ceramic mug is perfect for any event of the day. Your morning coffee, a hot chocolate, or any other hot beverage you enjoy. The mug is glossy white and the prints come out beautifully and vividly on it. The print retains its quality and luster when used in both microwaves and the dishwasher.- Ceramic 11oz mug- Dishwasher and microwave safe- Product safety tests conducted by independent third party laboratories.- Mug Height 96mm, Bottom Diameter 80mm- Designed by Jaana Särg-Raani for His Kingdom Designs.- World wide shipping',
    category: 'Mugs'
  },
  {
    id: '0d5de5f7-f765-4616-aefb-91edcbc87ff6',
    name: 'FAITH OVER FEAR - Classic Matte Paper Poster',
    description: 'Faith like a mustard seed.. Poster made on our lighter-weight, uncoated classic matte paper. The perfect option to stand the test of time: Paper Finishing: Matte, smooth, non-reflective surface. Paper Weight: 170 gsm (65 lb), thickness: 0.19 mm (7.5 mils), sturdy and durable. Sustainable Paper: FSC-certified or equivalent for sustainability.Designed by Jaana Särg-Raani for His Kingdom Designs, June 2026World wide shipping',
    category: 'Posters'
  },
  {
    id: '8d618b84-37f4-4e41-8b02-f150afaee2a5',
    name: 'Jeg spiste Jona - barnegenser',
    description: 'A comfortable and eco-friendly sweatshirt for kids made from a blend of cotton and recycled polyester. 80% cotton / 20% recycled polyester blend.Brushed fleece lining for added warmth. Ribbed cuffs and hem for a snug fit.Available in multiple colors. Durable and soft fabric.',
    category: 'Sweatshirts'
  },
  {
    id: 'ff6a4400-6764-45b2-a66e-2fbdae46fa4e',
    name: 'Herren velsigne deg Totebag/Handlenett',
    description: 'Titus 2:11 For Guds nåde er åpenbart til frelse for alle mennesker. Cover all your grab and go needs with these long handle tote bags while being eco-conscious. These tote bags feature reinforced stitching on handles for more stability. The unique designs will stand out on these 100% cotton fabric tote bags.- Reinforced stitching on handles- Capacity 10 litres- 100% cotton- 3 - 5 oz/yard², 100 - 170 g/m²',
    category: 'Bags'
  },
  {
    id: '834c1b89-4c2d-ddc2-8f03-3f55a4586408',
    name: '5 BIG size Stickers Monthly',
    description: 'MONTHLY SUBSCRIPTION OF 5 BIG STICKERS  (5,5 - 8cm)You have a 10% discount and pay 45NOK per month + shipping (49kr i Norge).  In this package you get:- the 5 big stickers of the month in English/Norwegian, (depending on what country you are from)- the Bible verse/passage of the month along with a study in English/Norwegian (depending on what country you are from)- You also get a surprise gift in the first shipment, and every 6 months after that. With this package you can both learn from God\'s word, decorate your things or give beautiful Bible Stickers away as gifts to someone you love.  Our profits go to missions and Christian work in Norway and internationally.  The subscription has an one month\'s notice. You can cancel the subscription whenever you want. The only thing you are committed to is two orders (First order and the cancellation order).',
    category: 'Subscriptions'
  }
];

console.log('Testing descriptions translations:\n');

mockProducts.forEach(p => {
  console.log(`=== Product: ${p.name} ===`);
  
  const transNo = getTranslatedProduct(p, 'no');
  const transEs = getTranslatedProduct(p, 'es');
  
  console.log('--- NORWEGIAN ---');
  console.log('Name:', transNo.name);
  console.log('Desc:', transNo.description);
  console.log();
  
  console.log('--- SPANISH ---');
  console.log('Name:', transEs.name);
  console.log('Desc:', transEs.description);
  console.log('\n');
});
