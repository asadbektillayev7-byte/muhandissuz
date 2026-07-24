-- Seed demo articles — run in Supabase SQL Editor
-- Delete later: DELETE FROM articles WHERE author_id = (SELECT id FROM authors WHERE name = 'Demo Content');

INSERT INTO authors (name, bio_uz, bio_en, role)
VALUES ('Demo Content', 'Demo maqolalar — keyinroq ochiriladi', 'Demo articles — to be deleted later', 'author')
ON CONFLICT DO NOTHING;

INSERT INTO categories (name_uz, name_en, slug, color) VALUES
  ('Mexanika', 'Mechanical Engineering', 'mechanical-engineering', '#3b82f6'),
  ('Elektr', 'Electrical Engineering', 'electrical-engineering', '#f59e0b'),
  ('Kimyo', 'Chemical Engineering', 'chemical-engineering', '#10b981'),
  ('Motosport', 'Motorsports Engineering', 'motorsports-engineering', '#ef4444'),
  ('Fuqarolik', 'Civil Engineering', 'civil-engineering', '#8b5cf6'),
  ('Atrofmuhit', 'Environmental Engineering', 'environmental-engineering', '#22c55e'),
  ('Suniy intellekt', 'AI', 'ai', '#ec4899')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO articles (title_uz, title_en, slug, category_id, excerpt_uz, excerpt_en, cover_image_url, author_id, published, tags)
SELECT 'Tishli gildiraklar va reduktorlar: Mashinalarda quvvat uzatish', 'Gears and Gearboxes: Power Transmission in Machines', 'gears-and-gearboxes', c.id, 'Mexanik uzatmalar turlari, tishli gildiraklarning geometriyasi va reduktorlarni loyihalash asoslari.', 'Types of mechanical drives, gear geometry, and gearbox design fundamentals.', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80', a.id, true, '["demo"]'
FROM categories c, (SELECT id FROM authors WHERE name = 'Demo Content') a
WHERE c.slug = 'mechanical-engineering';

INSERT INTO articles (title_uz, title_en, slug, category_id, excerpt_uz, excerpt_en, cover_image_url, author_id, published, tags)
SELECT 'Ichki yonuv dvigatellarining termodinamikasi', 'Thermodynamics of Internal Combustion Engines', 'thermodynamics-ic-engines', c.id, 'Otto va Diesel sikllari, issiqlik samaradorligi va dvigatel konstruksiyasiga termodinamik yondashuv.', 'Otto and Diesel cycles, thermal efficiency, and thermodynamic approach to engine design.', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80', a.id, true, '["demo"]'
FROM categories c, (SELECT id FROM authors WHERE name = 'Demo Content') a
WHERE c.slug = 'mechanical-engineering';

INSERT INTO articles (title_uz, title_en, slug, category_id, excerpt_uz, excerpt_en, cover_image_url, author_id, published, tags)
SELECT 'Yangi boshlovchilar uchun PCB dizayn asoslari', 'PCB Design Fundamentals for Beginners', 'pcb-design-basics', c.id, 'Printed circuit board yaratish bosqichlari: sxemadan tortib routing va manufacturingacha.', 'PCB creation steps: from schematic to routing and manufacturing.', 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80', a.id, true, '["demo"]'
FROM categories c, (SELECT id FROM authors WHERE name = 'Demo Content') a
WHERE c.slug = 'electrical-engineering';

INSERT INTO articles (title_uz, title_en, slug, category_id, excerpt_uz, excerpt_en, cover_image_url, author_id, published, tags)
SELECT 'Elektr dvigatellarni tushunish: DC dan Steppergacha', 'Understanding Electric Motors: From DC to Stepper', 'electric-motors-dc-stepper', c.id, 'Elektr dvigatellarining ishlash prinsipi, turlari va ularni boshqarish usullari.', 'Operating principles of electric motors, types, and control methods.', 'https://images.unsplash.com/photo-1563770551464-0c9fc0a5ca88?w=800&q=80', a.id, true, '["demo"]'
FROM categories c, (SELECT id FROM authors WHERE name = 'Demo Content') a
WHERE c.slug = 'electrical-engineering';

INSERT INTO articles (title_uz, title_en, slug, category_id, excerpt_uz, excerpt_en, cover_image_url, author_id, published, tags)
SELECT 'Sanoatda kimyoviy jarayonlarni optimallashtirish', 'Chemical Process Optimization in Industry', 'chemical-process-optimization', c.id, 'Reaktor dizayni, modda balansi va sanoat kimyoviy jarayonlarini samaradorligini oshirish usullari.', 'Reactor design, mass balance, and methods to improve industrial chemical process efficiency.', 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=800&q=80', a.id, true, '["demo"]'
FROM categories c, (SELECT id FROM authors WHERE name = 'Demo Content') a
WHERE c.slug = 'chemical-engineering';

INSERT INTO articles (title_uz, title_en, slug, category_id, excerpt_uz, excerpt_en, cover_image_url, author_id, published, tags)
SELECT 'Polimer muhandisligiga kirish', 'Introduction to Polymer Engineering', 'polymer-engineering-intro', c.id, 'Polimerlar turlari, ularning xossalari va sanoatda qollanilishi haqida umumiy malumot.', 'Types of polymers, their properties, and industrial applications.', 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80', a.id, true, '["demo"]'
FROM categories c, (SELECT id FROM authors WHERE name = 'Demo Content') a
WHERE c.slug = 'chemical-engineering';

INSERT INTO articles (title_uz, title_en, slug, category_id, excerpt_uz, excerpt_en, cover_image_url, author_id, published, tags)
SELECT 'Formula 1 aerodinamikasi: Downforce qanday ishlaydi', 'Aerodynamics in Formula 1: How Downforce Works', 'f1-aerodynamics-downforce', c.id, 'Ground effect, diffuzorlar va antikrillar yordamida avtomobilni yerga bosish kuchini oshirish.', 'Increasing downforce through ground effect, diffusers, and wings.', 'https://images.unsplash.com/photo-1599813390210-8c351f812e65?w=800&q=80', a.id, true, '["demo"]'
FROM categories c, (SELECT id FROM authors WHERE name = 'Demo Content') a
WHERE c.slug = 'motorsports-engineering';

INSERT INTO articles (title_uz, title_en, slug, category_id, excerpt_uz, excerpt_en, cover_image_url, author_id, published, tags)
SELECT 'Podveska geometriyasi va avtomobil dinamikasi', 'Suspension Geometry and Vehicle Dynamics', 'suspension-geometry-dynamics', c.id, 'Camber, caster va toe burchaklarining avtomobil boshqaruviga tasiri.', 'How camber, caster, and toe angles affect vehicle handling.', 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80', a.id, true, '["demo"]'
FROM categories c, (SELECT id FROM authors WHERE name = 'Demo Content') a
WHERE c.slug = 'motorsports-engineering';

INSERT INTO articles (title_uz, title_en, slug, category_id, excerpt_uz, excerpt_en, cover_image_url, author_id, published, tags)
SELECT 'Koprik dizayn prinsiplari: Rim arkalaridan tortilgan kopriklargacha', 'Bridge Design Principles: From Roman Arches to Cable-Stayed', 'bridge-design-principles', c.id, 'Turli koprik turlari, ularning konstruktiv xususiyatlari va yuk taqsimoti prinsiplari.', 'Different bridge types, their structural characteristics, and load distribution principles.', 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&q=80', a.id, true, '["demo"]'
FROM categories c, (SELECT id FROM authors WHERE name = 'Demo Content') a
WHERE c.slug = 'civil-engineering';

INSERT INTO articles (title_uz, title_en, slug, category_id, excerpt_uz, excerpt_en, cover_image_url, author_id, published, tags)
SELECT 'Zilzilabardosh binolarni loyihalash', 'Earthquake-Resistant Building Design', 'earthquake-resistant-design', c.id, 'Seysmik zonalarda binolarni mustahkamlash usullari va zamonaviy konstruktiv yechimlar.', 'Methods for reinforcing buildings in seismic zones and modern structural solutions.', 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80', a.id, true, '["demo"]'
FROM categories c, (SELECT id FROM authors WHERE name = 'Demo Content') a
WHERE c.slug = 'civil-engineering';

INSERT INTO articles (title_uz, title_en, slug, category_id, excerpt_uz, excerpt_en, cover_image_url, author_id, published, tags)
SELECT 'Qayta tiklanadigan energiya tizimlari: Quyosh va shamol integratsiyasi', 'Renewable Energy Systems: Solar and Wind Integration', 'renewable-energy-solar-wind', c.id, 'Quyosh panellari va shamol turbinalarini elektr tarmogiga integratsiya qilish texnologiyalari.', 'Technologies for integrating solar panels and wind turbines into the power grid.', 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80', a.id, true, '["demo"]'
FROM categories c, (SELECT id FROM authors WHERE name = 'Demo Content') a
WHERE c.slug = 'environmental-engineering';

INSERT INTO articles (title_uz, title_en, slug, category_id, excerpt_uz, excerpt_en, cover_image_url, author_id, published, tags)
SELECT 'Oqova suvlarni tozalash texnologiyalari', 'Wastewater Treatment Technologies', 'wastewater-treatment-tech', c.id, 'Membran bioreaktorlar, aktivated loy va boshqa zamonaviy tozalash usullari haqida.', 'Membrane bioreactors, activated sludge, and other modern treatment methods.', 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80', a.id, true, '["demo"]'
FROM categories c, (SELECT id FROM authors WHERE name = 'Demo Content') a
WHERE c.slug = 'environmental-engineering';

INSERT INTO articles (title_uz, title_en, slug, category_id, excerpt_uz, excerpt_en, cover_image_url, author_id, published, tags)
SELECT 'Tasvirni aniqlash uchun neyron tarmoqlar', 'Neural Networks for Image Recognition', 'neural-networks-image-recognition', c.id, 'Convolutional neyron tarmoqlar (CNN) yordamida tasvirlarni klassifikatsiya qilish asoslari.', 'Fundamentals of image classification using Convolutional Neural Networks (CNNs).', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80', a.id, true, '["demo"]'
FROM categories c, (SELECT id FROM authors WHERE name = 'Demo Content') a
WHERE c.slug = 'ai';

INSERT INTO articles (title_uz, title_en, slug, category_id, excerpt_uz, excerpt_en, cover_image_url, author_id, published, tags)
SELECT 'Katta til modellari: GPT qanday ishlaydi', 'Large Language Models: How GPT Works', 'large-language-models-gpt', c.id, 'Transformer arxitekturasi, attention mexanizmi va generativ modellarning ishlash prinsipi.', 'Transformer architecture, attention mechanism, and how generative models work.', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80', a.id, true, '["demo"]'
FROM categories c, (SELECT id FROM authors WHERE name = 'Demo Content') a
WHERE c.slug = 'ai';
