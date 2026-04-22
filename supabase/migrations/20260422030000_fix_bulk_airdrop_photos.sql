-- ═══════════════════════════════════════════════════════════════
-- FIX FOTO AIRDROP BULK — 22 Apr 2026
-- ═══════════════════════════════════════════════════════════════
-- Il bulk populate del 22/04 aveva riusato 5 foto locali per 40
-- prodotti diversi (stessa iPhone-foto su tutti gli smartphone) e
-- Picsum random sulle altre 11 categorie.
--
-- Qui: assegna a ogni airdrop una foto pertinente al prodotto via
-- Loremflickr keyword-search (Flickr tagged pool), con lock seed
-- univoco per garantire consistenza tra reload.
-- Per 3 airdrop dove la foto locale matcha il prodotto reale
-- (iPhone 15 Pro Max, PS5 Pro, LV Keepall 55) uso quella.
-- ═══════════════════════════════════════════════════════════════

DO $$
BEGIN
  WITH photos(title, url) AS (
    VALUES
      -- SMARTPHONE ────────────────────────────────────────────
      ('iPhone 15 Pro Max 256GB Titanio Naturale',           '/public/images/airdrop_iphone16promax.jpg'),
      ('Samsung Galaxy S24 Ultra 512GB Grigio Titanio',      'https://loremflickr.com/800/600/samsung,galaxy,ultra/all?lock=10102'),
      ('Google Pixel 8 Pro 256GB Obsidian',                  'https://loremflickr.com/800/600/google,pixel,smartphone/all?lock=10103'),
      ('iPhone 14 Pro 128GB Viola Scuro',                    'https://loremflickr.com/800/600/iphone,14,pro,purple/all?lock=10104'),
      ('OnePlus 12 512GB Flowy Emerald',                     'https://loremflickr.com/800/600/oneplus,smartphone,green/all?lock=10105'),
      ('Xiaomi 14 Ultra 16/512 Titanio',                     'https://loremflickr.com/800/600/xiaomi,leica,smartphone/all?lock=10106'),
      ('iPhone 13 Pro Max 1TB Sierra Blue',                  'https://loremflickr.com/800/600/iphone,13,pro,blue/all?lock=10107'),
      ('Samsung Galaxy Z Fold 5 512GB',                      'https://loremflickr.com/800/600/samsung,foldable,fold/all?lock=10108'),

      -- TABLET ────────────────────────────────────────────────
      ('iPad Pro M4 13 1TB Wi-Fi + Cellular',                'https://loremflickr.com/800/600/ipad,pro,tablet/all?lock=10201'),
      ('iPad Air M2 11 512GB Wi-Fi',                         'https://loremflickr.com/800/600/ipad,air,tablet/all?lock=10202'),
      ('Samsung Galaxy Tab S9 Ultra 14.6 512GB',             'https://loremflickr.com/800/600/samsung,galaxy,tab/all?lock=10203'),
      ('iPad Pro M2 12.9 256GB',                             'https://loremflickr.com/800/600/ipad,pro,apple/all?lock=10204'),
      ('Microsoft Surface Pro 9 i7 16/512',                  'https://loremflickr.com/800/600/surface,microsoft,tablet/all?lock=10205'),
      ('iPad Mini 6 256GB Cellular',                         'https://loremflickr.com/800/600/ipad,mini,apple/all?lock=10206'),
      ('Huawei MatePad Pro 13.2 PaperMatte',                 'https://loremflickr.com/800/600/huawei,matepad,tablet/all?lock=10207'),
      ('Lenovo Tab P12 Pro 8/256',                           'https://loremflickr.com/800/600/lenovo,tab,tablet/all?lock=10208'),

      -- COMPUTER ──────────────────────────────────────────────
      ('MacBook Pro M3 Max 16 64GB/2TB',                     'https://loremflickr.com/800/600/macbook,pro,laptop/all?lock=10301'),
      ('Dell XPS 15 OLED i9 32/1TB',                         'https://loremflickr.com/800/600/dell,xps,laptop/all?lock=10302'),
      ('Lenovo Legion Pro 5 RTX 4070',                       'https://loremflickr.com/800/600/lenovo,legion,gaming/all?lock=10303'),
      ('ASUS ROG Zephyrus G14 OLED',                         'https://loremflickr.com/800/600/asus,rog,zephyrus/all?lock=10304'),
      ('MacBook Air M3 15 24/1TB',                           'https://loremflickr.com/800/600/macbook,air,laptop/all?lock=10305'),
      ('HP Spectre x360 16 i7 OLED',                         'https://loremflickr.com/800/600/hp,spectre,laptop/all?lock=10306'),
      ('Framework Laptop 16 Ryzen 9',                        'https://loremflickr.com/800/600/framework,laptop,modular/all?lock=10307'),
      ('Microsoft Surface Laptop Studio 2',                  'https://loremflickr.com/800/600/surface,studio,microsoft/all?lock=10308'),

      -- GAMING ────────────────────────────────────────────────
      ('PlayStation 5 Pro Digital Edition',                  '/public/images/airdrop_ps5pro.jpg'),
      ('Xbox Series X 1TB + 2 Controller Elite',             'https://loremflickr.com/800/600/xbox,console,microsoft/all?lock=10402'),
      ('Nintendo Switch OLED + 10 Giochi',                   'https://loremflickr.com/800/600/nintendo,switch,oled/all?lock=10403'),
      ('ASUS ROG Ally X 1TB',                                'https://loremflickr.com/800/600/rog,ally,handheld/all?lock=10404'),
      ('Steam Deck OLED 1TB + Dock',                         'https://loremflickr.com/800/600/steam,deck,handheld/all?lock=10405'),
      ('Meta Quest 3 512GB + Elite Strap + Touch Pro',       'https://loremflickr.com/800/600/meta,quest,vr/all?lock=10406'),
      ('PlayStation VR2 + Horizon Bundle',                   'https://loremflickr.com/800/600/psvr,playstation,vr/all?lock=10407'),
      ('Razer Blade 16 OLED 240Hz',                          'https://loremflickr.com/800/600/razer,blade,gaming/all?lock=10408'),

      -- AUDIO ─────────────────────────────────────────────────
      ('Sony WH-1000XM5 + Shure SRH1840 Bundle',             'https://loremflickr.com/800/600/sony,headphones,wireless/all?lock=10501'),
      ('Bose QC Ultra + Soundbar 900 Bundle',                'https://loremflickr.com/800/600/bose,soundbar,headphones/all?lock=10502'),
      ('Apple AirPods Max + HomePod 2 + AirPods Pro 2',      'https://loremflickr.com/800/600/airpods,max,homepod/all?lock=10503'),
      ('Bowers & Wilkins Px8 McLaren Edition',               'https://loremflickr.com/800/600/bowers,wilkins,headphones/all?lock=10504'),
      ('Sennheiser HD 800S Reference Audiophile',            'https://loremflickr.com/800/600/sennheiser,headphones,studio/all?lock=10505'),
      ('Sony HT-A9 4.0.4 Home Cinema Wireless',              'https://loremflickr.com/800/600/sony,home,cinema,speaker/all?lock=10506'),
      ('Focal Bathys Wireless Bluetooth aptX',               'https://loremflickr.com/800/600/focal,headphones,wireless/all?lock=10507'),
      ('Audeze LCD-X Planar Magnetic Creator',               'https://loremflickr.com/800/600/audeze,planar,headphones/all?lock=10508'),

      -- FOTOGRAFIA ────────────────────────────────────────────
      ('Sony Alpha 7R V + FE 24-105 f/4 G',                  'https://loremflickr.com/800/600/sony,alpha,mirrorless/all?lock=10601'),
      ('Canon EOS R5 Mark II + RF 70-200 f/2.8',             'https://loremflickr.com/800/600/canon,eos,camera/all?lock=10602'),
      ('Nikon Z8 + Z 24-70 f/2.8 S',                         'https://loremflickr.com/800/600/nikon,z8,camera/all?lock=10603'),
      ('Fujifilm X-H2S + XF 16-55 f/2.8',                    'https://loremflickr.com/800/600/fujifilm,mirrorless,camera/all?lock=10604'),
      ('Leica Q3 60MP Fixed Lens',                           'https://loremflickr.com/800/600/leica,q3,camera/all?lock=10605'),
      ('Panasonic Lumix S5 IIX + 50 f/1.8',                  'https://loremflickr.com/800/600/panasonic,lumix,camera/all?lock=10606'),
      ('GoPro HERO12 Black Creator Kit',                     'https://loremflickr.com/800/600/gopro,hero,action/all?lock=10607'),
      ('DJI Ronin 4D 6K + Kit Pro',                          'https://loremflickr.com/800/600/dji,ronin,cinema/all?lock=10608'),

      -- OROLOGI ───────────────────────────────────────────────
      ('Rolex Submariner Date 41mm Oyster Steel',            'https://loremflickr.com/800/600/rolex,submariner,watch/all?lock=10701'),
      ('Omega Speedmaster Moonwatch Sapphire',               'https://loremflickr.com/800/600/omega,speedmaster,watch/all?lock=10702'),
      ('Tudor Black Bay 58 925 Silver',                      'https://loremflickr.com/800/600/tudor,blackbay,watch/all?lock=10703'),
      ('IWC Pilot Mark XX Spitfire Bronze',                  'https://loremflickr.com/800/600/iwc,pilot,watch/all?lock=10704'),
      ('Breitling Navitimer B01 46 Green',                   'https://loremflickr.com/800/600/breitling,navitimer,watch/all?lock=10705'),
      ('Panerai Luminor Marina 44mm Blue',                   'https://loremflickr.com/800/600/panerai,luminor,watch/all?lock=10706'),
      ('TAG Heuer Monaco Calibre 11 Blu',                    'https://loremflickr.com/800/600/tagheuer,monaco,watch/all?lock=10707'),
      ('Grand Seiko SBGA413 Shunbun Spring Drive',           'https://loremflickr.com/800/600/seiko,grand,watch/all?lock=10708'),

      -- GIOIELLI ──────────────────────────────────────────────
      ('Cartier LOVE Bracelet 18K Oro Rosa',                 'https://loremflickr.com/800/600/cartier,love,bracelet/all?lock=10801'),
      ('Tiffany & Co Elsa Peretti Diamond Pendant',          'https://loremflickr.com/800/600/tiffany,diamond,pendant/all?lock=10802'),
      ('Bulgari Serpenti Viper Anello Oro Rosa',             'https://loremflickr.com/800/600/bulgari,serpenti,ring/all?lock=10803'),
      ('Van Cleef Alhambra 20 Motif Madreperla',             'https://loremflickr.com/800/600/vancleef,alhambra,necklace/all?lock=10804'),
      ('Boucheron Quatre Classique Anello',                  'https://loremflickr.com/800/600/boucheron,quatre,ring/all?lock=10805'),
      ('Damiani Belle Epoque Reel Collana',                  'https://loremflickr.com/800/600/damiani,diamond,necklace/all?lock=10806'),
      ('Pomellato Nudo Quarzo Rosa Anello',                  'https://loremflickr.com/800/600/pomellato,nudo,ring/all?lock=10807'),
      ('Chopard Happy Diamonds Icons Anello',                'https://loremflickr.com/800/600/chopard,happy,diamonds/all?lock=10808'),

      -- BORSE ─────────────────────────────────────────────────
      ('Louis Vuitton Keepall 55 Monogram',                  '/public/images/airdrop_lv_keepall55.jpg'),
      ('Hermes Garden Party 36 Toile/Pelle',                 'https://loremflickr.com/800/600/hermes,garden,bag/all?lock=10902'),
      ('Chanel Classic Flap Medium Caviar',                  'https://loremflickr.com/800/600/chanel,flap,bag/all?lock=10903'),
      ('Dior Saddle Bag Oblique Jacquard',                   'https://loremflickr.com/800/600/dior,saddle,bag/all?lock=10904'),
      ('Prada Galleria Saffiano Large',                      'https://loremflickr.com/800/600/prada,galleria,saffiano/all?lock=10905'),
      ('Gucci GG Marmont Matelasse',                         'https://loremflickr.com/800/600/gucci,marmont,bag/all?lock=10906'),
      ('Bottega Veneta Cassette Padded Intrecciato',         'https://loremflickr.com/800/600/bottega,veneta,intrecciato/all?lock=10907'),
      ('Celine Triomphe Canvas Beige',                       'https://loremflickr.com/800/600/celine,triomphe,bag/all?lock=10908'),

      -- MODA ──────────────────────────────────────────────────
      ('Moncler Maya Down Jacket Navy',                      'https://loremflickr.com/800/600/moncler,jacket,down/all?lock=11001'),
      ('Brunello Cucinelli Cashmere Cardigan',               'https://loremflickr.com/800/600/cashmere,cardigan,luxury/all?lock=11002'),
      ('Tom Ford Atticus Tuxedo Suit',                       'https://loremflickr.com/800/600/tuxedo,suit,tomford/all?lock=11003'),
      ('Balenciaga Triple S Clear Sole',                     'https://loremflickr.com/800/600/balenciaga,sneakers,triple/all?lock=11004'),
      ('Off-White Diagonal Stripe Hoodie Set',               'https://loremflickr.com/800/600/offwhite,hoodie,streetwear/all?lock=11005'),
      ('Isabel Marant Silver Sequin Dress',                  'https://loremflickr.com/800/600/sequin,dress,silver/all?lock=11006'),
      ('Etro Paisley Silk Shirt Set',                        'https://loremflickr.com/800/600/etro,paisley,shirt/all?lock=11007'),
      ('Loro Piana Cashmere Coat Camel',                     'https://loremflickr.com/800/600/cashmere,coat,camel/all?lock=11008'),

      -- BICICLETTE ────────────────────────────────────────────
      ('Specialized Turbo Vado SL 5.0 E-Bike',               'https://loremflickr.com/800/600/specialized,ebike,turbo/all?lock=11101'),
      ('Trek Domane SLR 9 Carbon Road',                      'https://loremflickr.com/800/600/trek,domane,road/all?lock=11102'),
      ('Cannondale Topstone Neo Carbon',                     'https://loremflickr.com/800/600/cannondale,topstone,gravel/all?lock=11103'),
      ('Bianchi Oltre XR4 Disc Campagnolo',                  'https://loremflickr.com/800/600/bianchi,oltre,celeste/all?lock=11104'),
      ('Giant Revolt Advanced Pro 0',                        'https://loremflickr.com/800/600/giant,revolt,gravel/all?lock=11105'),
      ('Canyon Grail CF SL 8 Di2',                           'https://loremflickr.com/800/600/canyon,grail,gravel/all?lock=11106'),
      ('Cervelo Caledonia-5 Ultegra Di2',                    'https://loremflickr.com/800/600/cervelo,caledonia,road/all?lock=11107'),
      ('Pinarello Dogma F12 Disk Vincitore Tour',            'https://loremflickr.com/800/600/pinarello,dogma,road/all?lock=11108'),

      -- ARREDAMENTO ───────────────────────────────────────────
      ('Kartell Louis Ghost 4 Sedie + Tavolo Invisible',     'https://loremflickr.com/800/600/kartell,ghost,chair/all?lock=11201'),
      ('B&B Italia Charles Sofa 3-Seats',                    'https://loremflickr.com/800/600/leather,sofa,italian/all?lock=11202'),
      ('Flos Arco Lampada Design',                           'https://loremflickr.com/800/600/flos,arco,lamp/all?lock=11203'),
      ('Eames Lounge Chair + Ottoman Herman Miller',         'https://loremflickr.com/800/600/eames,lounge,chair/all?lock=11204'),
      ('Poliform Bristol Poltrona Cashmere',                 'https://loremflickr.com/800/600/armchair,cashmere,luxury/all?lock=11205'),
      ('Cassina LC4 Chaise Lounge Corbusier',                'https://loremflickr.com/800/600/lc4,corbusier,chaise/all?lock=11206'),
      ('Artemide Tolomeo Lampade Set 4',                     'https://loremflickr.com/800/600/artemide,tolomeo,lamp/all?lock=11207'),
      ('Gervasoni Ghost Bed Queen Size',                     'https://loremflickr.com/800/600/bed,linen,bedroom/all?lock=11208'),

      -- SPORT ─────────────────────────────────────────────────
      ('Peloton Bike+ All Access Bundle',                    'https://loremflickr.com/800/600/peloton,bike,fitness/all?lock=11301'),
      ('NordicTrack X32i Incline Trainer',                   'https://loremflickr.com/800/600/treadmill,fitness,cardio/all?lock=11302'),
      ('Dyson Supersonic + Tecnogym Wellness Kit',           'https://loremflickr.com/800/600/fitness,wellness,kit/all?lock=11303'),
      ('Salomon MTN Lab Ski + Boots + Skins',                'https://loremflickr.com/800/600/salomon,ski,mountain/all?lock=11304'),
      ('Callaway Paradym Ai Smoke Golf Set',                 'https://loremflickr.com/800/600/callaway,golf,clubs/all?lock=11305'),
      ('Wilson Pro Staff RF97 Federer Kit',                  'https://loremflickr.com/800/600/wilson,tennis,racquet/all?lock=11306'),
      ('Head Graphene 360+ Radical Pro Kit',                 'https://loremflickr.com/800/600/head,tennis,racquet/all?lock=11307'),
      ('Atomic Redster G9 Race Ski Kit',                     'https://loremflickr.com/800/600/atomic,ski,race/all?lock=11308'),

      -- STRUMENTI ─────────────────────────────────────────────
      ('Fender Stratocaster American Ultra HSS',             'https://loremflickr.com/800/600/fender,stratocaster,guitar/all?lock=11401'),
      ('Gibson Les Paul Standard 60s Heritage',              'https://loremflickr.com/800/600/gibson,lespaul,guitar/all?lock=11402'),
      ('Yamaha C7X Grand Piano Concert',                     'https://loremflickr.com/800/600/yamaha,grand,piano/all?lock=11403'),
      ('Nord Stage 4 88 Performance Keyboard',               'https://loremflickr.com/800/600/nord,stage,keyboard/all?lock=11404'),
      ('Moog One 16 Voice Analog Synthesizer',               'https://loremflickr.com/800/600/moog,synthesizer,analog/all?lock=11405'),
      ('Martin D-45 Reimagined Acoustic',                    'https://loremflickr.com/800/600/martin,acoustic,guitar/all?lock=11406'),
      ('Roland V-Drums TD-50KV2 Premium Kit',                'https://loremflickr.com/800/600/roland,drums,electronic/all?lock=11407'),
      ('Taylor 914ce V-Class Acoustic-Electric',             'https://loremflickr.com/800/600/taylor,acoustic,guitar/all?lock=11408'),

      -- ARTE ──────────────────────────────────────────────────
      ('Banksy Original Print Girl with Balloon',            'https://loremflickr.com/800/600/banksy,street,art/all?lock=11501'),
      ('Andy Warhol Marilyn Screenprint',                    'https://loremflickr.com/800/600/warhol,marilyn,popart/all?lock=11502'),
      ('Fontana Concetto Spaziale Original Print',           'https://loremflickr.com/800/600/fontana,concetto,spaziale/all?lock=11503'),
      ('Arnaldo Pomodoro Sfera 40cm',                        'https://loremflickr.com/800/600/pomodoro,sphere,sculpture/all?lock=11504'),
      ('Collezione Moneta Romana Imperiale Set 12',          'https://loremflickr.com/800/600/roman,coins,numismatic/all?lock=11505'),
      ('Keith Haring Barking Dog Original Signed',           'https://loremflickr.com/800/600/haring,streetart,print/all?lock=11506'),
      ('Damien Hirst Spot Print Signed Numbered',            'https://loremflickr.com/800/600/hirst,spot,print/all?lock=11507'),
      ('Takashi Murakami Flower Print Signed',               'https://loremflickr.com/800/600/murakami,flower,art/all?lock=11508'),

      -- VINO ──────────────────────────────────────────────────
      ('Sassicaia 2019 Cassa 6 bottiglie OC',                'https://loremflickr.com/800/600/wine,bottle,bolgheri/all?lock=11601'),
      ('Masseto 2020 Bottiglia 0.75l OC',                    'https://loremflickr.com/800/600/wine,bottle,merlot/all?lock=11602'),
      ('Dom Perignon P2 2004 Bottiglia',                     'https://loremflickr.com/800/600/dom,perignon,champagne/all?lock=11603'),
      ('Chateau Latour 2015 Cassa 6 OC',                     'https://loremflickr.com/800/600/chateau,latour,bordeaux/all?lock=11604'),
      ('Romanee-Conti La Tache 2019 Bottiglia',              'https://loremflickr.com/800/600/wine,burgundy,grand,cru/all?lock=11605'),
      ('Opus One 2019 Cassa 6 OC',                           'https://loremflickr.com/800/600/opus,napa,wine/all?lock=11606'),
      ('Ornellaia Verticale 2015-2019 5 Annate',             'https://loremflickr.com/800/600/ornellaia,wine,tuscany/all?lock=11607'),
      ('Gaja Barbaresco 2019 Cassa 12 OC',                   'https://loremflickr.com/800/600/barbaresco,wine,piemonte/all?lock=11608')
  )
  UPDATE airdrops a
    SET image_url = p.url
    FROM photos p
    WHERE a.title = p.title
      AND a.product_info->>'bulk_populate' = 'true';

  RAISE NOTICE 'Fix foto bulk airdrop: % righe aggiornate',
    (SELECT count(*) FROM airdrops WHERE product_info->>'bulk_populate' = 'true');
END$$;
