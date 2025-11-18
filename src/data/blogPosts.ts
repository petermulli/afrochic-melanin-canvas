export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  readTime: string;
  author: {
    name: string;
    role: string;
    avatar: string;
    bio: string;
  };
  publishedDate: string;
  tags: string[];
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    slug: "understanding-your-skin-type",
    title: "Understanding Your Skin Type",
    excerpt: "Discover the secrets to identifying your unique skin type and choosing products that work perfectly for you.",
    content: `
# Understanding Your Skin Type

Knowing your skin type is the foundation of an effective skincare routine. When you understand your skin's unique needs, you can choose products that truly work for you.

## The Five Main Skin Types

### Normal Skin
Normal skin is well-balanced – not too oily and not too dry. It has a smooth texture, small pores, and few imperfections. If you have normal skin, you're one of the lucky ones! Maintain your skin's balance with gentle, hydrating products.

### Dry Skin
Dry skin lacks moisture and can feel tight, especially after cleansing. It may appear flaky, rough, or dull. Look for rich, nourishing moisturizers with ingredients like hyaluronic acid, ceramides, and natural oils.

### Oily Skin
Oily skin produces excess sebum, leading to a shiny appearance, enlarged pores, and potential breakouts. Choose lightweight, oil-free products that won't clog pores. Ingredients like niacinamide and salicylic acid can help balance oil production.

### Combination Skin
Combination skin is oily in some areas (typically the T-zone) and dry in others. This skin type requires a balanced approach – use lighter products on oily areas and richer ones where needed.

### Sensitive Skin
Sensitive skin is easily irritated and may react to certain ingredients or environmental factors. It can appear red, itchy, or inflamed. Choose fragrance-free, hypoallergenic products with soothing ingredients like aloe vera and chamomile.

## How to Determine Your Skin Type

**The Bare-Faced Test**: Wash your face with a gentle cleanser, pat dry, and wait 30 minutes. Examine your skin:
- If it feels comfortable and looks normal, you have normal skin
- If it feels tight and looks flaky, you have dry skin
- If you see shine all over, especially on your nose and forehead, you have oily skin
- If some areas are shiny while others feel tight, you have combination skin
- If your skin looks red or feels irritated, you may have sensitive skin

## Choosing Products for Your Skin Type

Once you know your skin type, you can build a routine that works:

**For Dry Skin**: Look for cream-based cleansers, rich moisturizers, and hydrating serums with hyaluronic acid.

**For Oily Skin**: Choose gel or foam cleansers, lightweight moisturizers, and mattifying products.

**For Combination Skin**: Use different products on different areas, or opt for balancing formulas that work for both oily and dry zones.

**For Sensitive Skin**: Select gentle, fragrance-free products with minimal ingredients.

## Remember

Your skin type can change with seasons, age, and lifestyle factors. Pay attention to how your skin behaves and adjust your routine accordingly. At AfroChic, we formulate our products to work beautifully with melanin-rich skin of all types.
    `,
    category: "Skincare",
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&q=80",
    readTime: "5 min read",
    author: {
      name: "Dr. Amara Okonkwo",
      role: "Dermatologist & Skincare Specialist",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80",
      bio: "Dr. Amara is a board-certified dermatologist specializing in skincare for melanin-rich skin. She has over 15 years of experience helping clients achieve their healthiest, most radiant skin."
    },
    publishedDate: "2024-03-15",
    tags: ["skincare", "skin types", "beauty basics"]
  },
  {
    id: 2,
    slug: "power-of-natural-ingredients",
    title: "The Power of Natural Ingredients",
    excerpt: "Explore how indigenous African botanicals can transform your beauty routine with their healing properties.",
    content: `
# The Power of Natural Ingredients

Africa's rich botanical heritage offers some of the most powerful natural ingredients for skincare. For centuries, these plants have been used for their healing and beautifying properties.

## Indigenous African Botanicals

### Shea Butter
Extracted from the nuts of the shea tree, native to West Africa, shea butter is deeply moisturizing and rich in vitamins A, E, and F. It's perfect for nourishing dry skin and has anti-inflammatory properties.

### Marula Oil
From the marula tree of Southern Africa, this lightweight oil is packed with antioxidants and essential fatty acids. It absorbs quickly and helps protect skin from environmental damage.

### Baobab Oil
The "Tree of Life" produces seeds that yield a nutrient-rich oil high in vitamins A, D, E, and omega fatty acids. It's excellent for improving skin elasticity and fighting signs of aging.

### African Black Soap
Made from plantain skin, cocoa pod ash, and palm oil, this traditional soap gently cleanses while maintaining skin's natural moisture. It's particularly beneficial for acne-prone skin.

### Rooibos
This South African red tea is loaded with antioxidants and has powerful anti-aging properties. It soothes sensitive skin and reduces redness.

## The Science Behind Natural Ingredients

Natural doesn't just mean gentle – these ingredients are scientifically proven to be effective:

- **Antioxidants** fight free radicals that cause premature aging
- **Essential fatty acids** strengthen the skin barrier
- **Vitamins** support cellular repair and regeneration
- **Natural antimicrobials** help prevent breakouts without harsh chemicals

## Why Natural Ingredients Matter for Melanin-Rich Skin

Melanin-rich skin has unique needs. Natural ingredients work in harmony with your skin's natural processes, providing nourishment without disrupting the delicate balance that keeps your complexion glowing.

At AfroChic, we carefully select and combine these powerful botanicals to create products that honor both tradition and science.
    `,
    category: "Ingredients",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80",
    readTime: "7 min read",
    author: {
      name: "Zainab Kimathi",
      role: "Botanical Formulation Expert",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80",
      bio: "Zainab is a cosmetic chemist with a passion for African botanicals. She travels across the continent researching indigenous ingredients and their applications in modern skincare."
    },
    publishedDate: "2024-03-10",
    tags: ["natural ingredients", "botanicals", "African beauty"]
  },
  {
    id: 3,
    slug: "melanin-rich-skin-care",
    title: "Melanin-Rich Skin Care Tips",
    excerpt: "Expert advice on maintaining radiant, healthy skin with products specifically formulated for melanin-rich complexions.",
    content: `
# Melanin-Rich Skin Care Tips

Melanin-rich skin is beautiful, resilient, and has unique characteristics that require specialized care. Here's everything you need to know about keeping your complexion radiant.

## Understanding Melanin-Rich Skin

Melanin provides natural protection against UV damage, but it also means your skin responds differently to environmental factors and skincare products. Understanding these differences is key to effective care.

## Key Skincare Tips

### 1. Gentle Cleansing
Avoid harsh cleansers that strip natural oils. Opt for cream or oil-based cleansers that maintain your skin's protective barrier.

### 2. Consistent Moisturizing
Even oily melanin-rich skin needs moisture. Use lightweight, non-comedogenic moisturizers to keep skin hydrated without clogging pores.

### 3. Sun Protection
While melanin offers some UV protection, it's not enough. Always wear SPF 30 or higher to prevent hyperpigmentation and premature aging.

### 4. Address Hyperpigmentation
Melanin-rich skin is prone to post-inflammatory hyperpigmentation. Use products with vitamin C, niacinamide, or kojic acid to even skin tone.

### 5. Be Patient with Active Ingredients
Melanin-rich skin can be sensitive to strong actives. Start slowly with ingredients like retinol or AHAs to avoid irritation.

## Common Concerns

### Dark Spots
These can result from acne, inflammation, or sun exposure. Prevention is key – treat breakouts gently and always use sunscreen.

### Ashy Appearance
This is simply dry skin showing more visibly on darker tones. Regular exfoliation and deep moisturizing can eliminate ashiness.

### Uneven Tone
Consistent skincare, sun protection, and targeted treatments can help achieve an even complexion.

## Building Your Routine

**Morning**:
- Gentle cleanser
- Vitamin C serum
- Moisturizer
- SPF 30+

**Evening**:
- Oil-based cleanser
- Water-based cleanser (double cleanse)
- Treatment serum (niacinamide, retinol, etc.)
- Night cream or oil

Remember, consistency is more important than having many products. Stick to a routine that works for your skin!
    `,
    category: "Beauty Tips",
    image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&q=80",
    readTime: "6 min read",
    author: {
      name: "Dr. Amara Okonkwo",
      role: "Dermatologist & Skincare Specialist",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80",
      bio: "Dr. Amara is a board-certified dermatologist specializing in skincare for melanin-rich skin. She has over 15 years of experience helping clients achieve their healthiest, most radiant skin."
    },
    publishedDate: "2024-03-05",
    tags: ["melanin", "skincare routine", "beauty tips"]
  },
  {
    id: 4,
    slug: "sun-protection-essentials",
    title: "Sun Protection Essentials",
    excerpt: "Why SPF matters for all skin tones and how to choose the right protection for your daily routine.",
    content: `
# Sun Protection Essentials

There's a common misconception that melanin-rich skin doesn't need sun protection. Let's set the record straight: everyone needs SPF, regardless of skin tone.

## Why SPF Matters for Melanin-Rich Skin

While melanin does provide some natural sun protection (equivalent to SPF 13), it's not enough to prevent:
- Premature aging
- Hyperpigmentation
- Skin cancer (yes, people of all skin tones can develop skin cancer)
- Sun damage

## Understanding SPF

SPF (Sun Protection Factor) measures protection against UVB rays, which cause sunburn. But you also need protection from UVA rays, which cause premature aging.

Look for "broad spectrum" sunscreens that protect against both UVA and UVB rays.

## Choosing the Right Sunscreen

### For Melanin-Rich Skin
Traditional sunscreens often leave a white cast on darker skin tones. Look for:

- **Mineral sunscreens** with tinted formulas
- **Chemical sunscreens** that absorb into the skin
- **Combination formulas** that offer the best of both
- **"No white cast" specifically formulated** for darker skin tones

### Key Ingredients
- Zinc oxide (mineral, tinted versions work best)
- Titanium dioxide (mineral)
- Avobenzone (chemical)
- Octinoxate (chemical)

## How to Apply

1. Use a quarter-sized amount for your face
2. Apply 15 minutes before sun exposure
3. Reapply every 2 hours
4. Reapply immediately after swimming or sweating
5. Don't forget your neck, ears, and hands!

## SPF in Your Makeup

While makeup with SPF is helpful, it shouldn't be your only protection. You'd need to apply 7 times the normal amount of foundation to get the stated SPF protection. Use a dedicated sunscreen first.

## Daily Protection

Make SPF a non-negotiable part of your morning routine. Even on cloudy days, up to 80% of UV rays can penetrate clouds. Even indoors, UVA rays can pass through windows.

## AfroChic's Approach

Our skincare line includes lightweight, non-greasy sunscreens specifically formulated to enhance melanin-rich skin without leaving any white cast. Protect your beautiful skin and keep it glowing for years to come.
    `,
    category: "Skincare",
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&q=80",
    readTime: "4 min read",
    author: {
      name: "Nia Mwangi",
      role: "Beauty & Wellness Writer",
      avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80",
      bio: "Nia is a beauty journalist with a focus on inclusive beauty and wellness. She's passionate about educating others on skincare that celebrates all skin tones."
    },
    publishedDate: "2024-03-01",
    tags: ["SPF", "sun protection", "skincare"]
  },
  {
    id: 5,
    slug: "building-beauty-routine",
    title: "Building Your Beauty Routine",
    excerpt: "A step-by-step guide to creating a personalized skincare routine that fits your lifestyle and delivers results.",
    content: `
# Building Your Beauty Routine

Creating an effective skincare routine doesn't have to be complicated. The key is finding the right products and using them consistently.

## The Basic Framework

### Morning Routine (3-5 Steps)
1. **Cleanse** – Remove overnight buildup
2. **Tone** (optional) – Balance and prep skin
3. **Treat** – Apply serums for specific concerns
4. **Moisturize** – Lock in hydration
5. **Protect** – Apply SPF (non-negotiable!)

### Evening Routine (4-6 Steps)
1. **Remove Makeup** – Use an oil-based cleanser or micellar water
2. **Cleanse** – Follow with a water-based cleanser (double cleanse)
3. **Exfoliate** (2-3x per week) – Remove dead skin cells
4. **Tone** (optional) – Prep for treatments
5. **Treat** – Apply targeted serums (retinol, etc.)
6. **Moisturize** – Night cream or facial oil

## Building Your Custom Routine

### Step 1: Know Your Skin Type
- Dry skin needs rich, creamy products
- Oily skin benefits from lightweight, oil-free formulas
- Combination skin may need different products for different areas
- Sensitive skin requires gentle, fragrance-free options

### Step 2: Identify Your Concerns
What do you want to address?
- Acne
- Dark spots/hyperpigmentation
- Fine lines and wrinkles
- Dullness
- Uneven texture

### Step 3: Choose Your Products
Start with the basics, then add treatments as needed:

**Must-Haves:**
- Gentle cleanser
- Moisturizer
- SPF 30+

**Great Additions:**
- Vitamin C serum (brightening)
- Niacinamide (pores, texture)
- Retinol (anti-aging)
- AHA/BHA exfoliant

### Step 4: Introduce Products Slowly
Don't start everything at once! Add one new product at a time, waiting 1-2 weeks to see how your skin responds.

## Common Mistakes to Avoid

1. **Over-cleansing** – Washing too often strips natural oils
2. **Skipping moisturizer** – Even oily skin needs hydration
3. **Not using SPF** – The biggest skincare mistake you can make
4. **Expecting overnight results** – Good skincare takes time
5. **Using too many actives** – Less is often more

## Adjusting for Seasons

Your skin's needs change throughout the year:

**Summer**: Lighter products, more frequent cleansing, higher SPF
**Winter**: Richer moisturizers, hydrating masks, gentle cleansing

## When to See Results

- **Moisturizing products**: Immediate to 1 week
- **Exfoliants**: 2-4 weeks
- **Vitamin C**: 4-8 weeks
- **Retinol**: 12+ weeks
- **Overall routine**: 3-6 months

## The Bottom Line

The best routine is one you'll stick to. Start simple, be consistent, and adjust as needed. Your skin will thank you!
    `,
    category: "Guides",
    image: "https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=800&q=80",
    readTime: "8 min read",
    author: {
      name: "Dr. Amara Okonkwo",
      role: "Dermatologist & Skincare Specialist",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80",
      bio: "Dr. Amara is a board-certified dermatologist specializing in skincare for melanin-rich skin. She has over 15 years of experience helping clients achieve their healthiest, most radiant skin."
    },
    publishedDate: "2024-02-25",
    tags: ["routine", "skincare guide", "beauty basics"]
  },
  {
    id: 6,
    slug: "sustainable-beauty-choices",
    title: "Sustainable Beauty Choices",
    excerpt: "Learn how to make eco-conscious beauty decisions that benefit both your skin and the environment.",
    content: `
# Sustainable Beauty Choices

Beautiful skin and a beautiful planet go hand in hand. Here's how to make your beauty routine more sustainable without compromising on results.

## Why Sustainable Beauty Matters

The beauty industry produces over 120 billion units of packaging annually, much of which isn't recyclable. By making conscious choices, you can look good while doing good.

## Key Principles of Sustainable Beauty

### 1. Choose Quality Over Quantity
Invest in multi-purpose products that work well rather than accumulating products you'll never finish.

### 2. Look for Sustainable Packaging
- Glass containers (recyclable and reusable)
- Aluminum tubes (infinitely recyclable)
- PCR (Post-Consumer Recycled) plastic
- Refillable options

### 3. Support Ethical Sourcing
Choose brands that:
- Source ingredients responsibly
- Support fair trade practices
- Give back to communities
- Use renewable resources

### 4. Minimize Water Usage
- Choose concentrated formulas
- Use waterless products when possible
- Turn off the tap while applying products

## Sustainable Swaps

### Easy Changes
- Bar soap instead of liquid (less packaging)
- Reusable cotton rounds instead of disposable
- Solid shampoo bars instead of bottled
- Refillable containers
- Multi-use products

### Ingredient Choices
Look for:
- Locally sourced botanicals
- Organic ingredients
- Sustainably harvested oils
- Biodegradable formulas

Avoid:
- Palm oil (unless sustainably sourced)
- Microbeads
- Excess packaging
- Single-use products

## The AfroChic Commitment

At AfroChic, sustainability is at our core:

**Ingredients**: We source African botanicals directly from local communities, supporting sustainable farming practices and fair wages.

**Packaging**: Our products come in recyclable glass and aluminum, with refill options available for our best-sellers.

**Community**: A portion of every purchase supports environmental conservation projects across Kenya.

**Production**: We use renewable energy in our facilities and minimize water waste in our manufacturing processes.

## Tips for a Sustainable Routine

1. **Finish what you start** – Use up products before buying new ones
2. **Recycle properly** – Clean containers before recycling
3. **Choose concentrated formulas** – Less product, less packaging, less shipping
4. **Buy local when possible** – Reduce carbon footprint from shipping
5. **DIY treatments** – Use natural ingredients you already have (honey, oatmeal, etc.)

## Beauty That Doesn't Cost the Earth

Sustainable beauty isn't about perfection – it's about making better choices when you can. Every small change adds up to make a big difference.

Remember: The most sustainable product is the one you'll actually use. Choose quality products that work for your skin and your values.
    `,
    category: "Sustainability",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
    readTime: "5 min read",
    author: {
      name: "Zainab Kimathi",
      role: "Botanical Formulation Expert",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80",
      bio: "Zainab is a cosmetic chemist with a passion for African botanicals. She travels across the continent researching indigenous ingredients and their applications in modern skincare."
    },
    publishedDate: "2024-02-20",
    tags: ["sustainability", "eco-friendly", "ethical beauty"]
  }
];

export const getRelatedPosts = (currentPostId: number, count: number = 3): BlogPost[] => {
  const currentPost = blogPosts.find(post => post.id === currentPostId);
  if (!currentPost) return [];
  
  return blogPosts
    .filter(post => 
      post.id !== currentPostId && 
      (post.category === currentPost.category || 
       post.tags.some(tag => currentPost.tags.includes(tag)))
    )
    .slice(0, count);
};
