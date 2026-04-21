-- ═══════════════════════════════════════════════════════════════
-- BULK POPULATE AIRDROPS — 22 Apr 2026 (Alpha testing)
-- ═══════════════════════════════════════════════════════════════
-- Per ogni categoria attiva (16):
--   - 3 airdrop in stato 'in_valutazione' (flow utente standard)
--   - 5 airdrop in stato 'presale' (presale attiva)
--
-- Tutte le submission decurtano 50 ARIA al CEO (policy bulk populate).
-- seller_min_price = seller_desired_price - 250 EUR.
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_ceo uuid;
  v_bal integer;
  v_need integer := 128 * 50;  -- 6400 ARIA
  v_airdrop_id uuid;
  v_r record;
  v_block_price integer;
  v_presale_price integer;
  v_total_blocks integer;
  v_object_value numeric;
  v_seq integer := 0;
  v_photo text;
  v_status text;
BEGIN
  SELECT id, total_points INTO v_ceo, v_bal
  FROM profiles WHERE email='ceo@airoobi.com';

  -- Grant 1 miliardo ARIA se il saldo non basta per coprire il bulk
  IF v_bal < v_need THEN
    UPDATE profiles SET total_points = total_points + 1000000000 WHERE id = v_ceo;
    INSERT INTO points_ledger (user_id, amount, reason, metadata)
    VALUES (v_ceo, 1000000000, 'admin_grant',
      jsonb_build_object('note','Bulk populate airdrop Alpha testing',
                        'date','2026-04-22','granted_by','system'));
  END IF;

  -- Iteriamo catalogo: per ciascuna riga creiamo un airdrop.
  -- Convention: idx 1-3 → in_valutazione; idx 4-8 → presale.
  FOR v_r IN
    SELECT * FROM (VALUES
      -- SMARTPHONE (block=5 ARIA)
      ('smartphone',1,'iPhone 15 Pro Max 256GB Titanio Naturale','Top di gamma Apple 2024, chip A17 Pro, display Super Retina XDR ProMotion 120Hz, fotocamera principale 48MP con teleobiettivo 5×. Scocca in titanio di grado 5. Perfetto.',1350,5),
      ('smartphone',2,'Samsung Galaxy S24 Ultra 512GB Grigio Titanio','Pennino S Pen integrato, display Dynamic AMOLED 2X 6.8" 120Hz, fotocamera 200MP Quad Tele, Snapdragon 8 Gen 3. Condizioni pari al nuovo.',1450,5),
      ('smartphone',3,'Google Pixel 8 Pro 256GB Obsidian','Processore Tensor G3, fotocamera computazionale Google Magic Editor, display LTPO OLED 6.7" 120Hz. Garanzia Google fino al 2031.',950,5),
      ('smartphone',4,'iPhone 14 Pro 128GB Viola Scuro','Display ProMotion 120Hz, Dynamic Island, chip A16 Bionic, fotocamera 48MP. Condizioni eccellenti, solo uso leggero.',1050,5),
      ('smartphone',5,'OnePlus 12 512GB Flowy Emerald','Snapdragon 8 Gen 3, display LTPO 120Hz 4500 nit, fotocamera Hasselblad triple 50MP. Ricarica 100W + 50W wireless.',850,5),
      ('smartphone',6,'Xiaomi 14 Ultra 16/512 Titanio','Leica optics Summilux 1" sensor, Snapdragon 8 Gen 3, display LTPO 120Hz 3000 nit. Photography Kit incluso.',1250,5),
      ('smartphone',7,'iPhone 13 Pro Max 1TB Sierra Blue','Chip A15 Bionic, ProMotion 120Hz 6.7", fotocamera 12MP con ProRAW. Storage massimo disponibile. Ottime condizioni.',950,5),
      ('smartphone',8,'Samsung Galaxy Z Fold 5 512GB','Foldable flagship, display pieghevole 7.6" AMOLED + cover 6.2", Snapdragon 8 Gen 2. S Pen compatibile.',1850,5),

      -- TABLET (block=5)
      ('tablet',1,'iPad Pro M4 13" 1TB Wi-Fi + Cellular','Chip Apple M4, display Ultra Retina XDR Tandem OLED, Thunderbolt 4, Apple Pencil Pro compatibile. Storage 1TB + cellular.',2150,5),
      ('tablet',2,'iPad Air M2 11" 512GB Wi-Fi','Chip M2, display Liquid Retina, compatibile Apple Pencil Pro, Magic Keyboard. Come nuovo.',1050,5),
      ('tablet',3,'Samsung Galaxy Tab S9 Ultra 14.6" 512GB','Display AMOLED 14.6" 120Hz, Snapdragon 8 Gen 2 for Galaxy, S Pen inclusa, resistenza IP68.',1350,5),
      ('tablet',4,'iPad Pro M2 12.9" 256GB','Chip M2, display Liquid Retina XDR mini-LED, Thunderbolt/USB 4, Face ID. Apple Pencil 2 inclusa.',1450,5),
      ('tablet',5,'Microsoft Surface Pro 9 i7 16/512','Intel Core i7-1265U, 16GB RAM, 512GB SSD, display 13" PixelSense. Type Cover + Surface Pen inclusi.',1850,5),
      ('tablet',6,'iPad Mini 6 256GB Cellular','Compatto e potente, A15 Bionic, display Liquid Retina 8.3". 5G cellular. Perfect for portability.',750,5),
      ('tablet',7,'Huawei MatePad Pro 13.2" PaperMatte','Display OLED 13.2" 144Hz PaperMatte anti-riflesso, Kirin 9000WL, M-Pencil incluso.',1050,5),
      ('tablet',8,'Lenovo Tab P12 Pro 8/256','Display AMOLED 12.7" 120Hz, Snapdragon 870, Dolby Atmos 4 speakers JBL, Precision Pen 3.',850,5),

      -- COMPUTER (block=10)
      ('computer',1,'MacBook Pro M3 Max 16" 64GB/2TB','Apple M3 Max 16-core, 64GB unified memory, 2TB SSD. Liquid Retina XDR 16.2" 120Hz. Configurazione top.',4850,10),
      ('computer',2,'Dell XPS 15 OLED i9 32/1TB','Intel Core i9-13900H, 32GB DDR5, 1TB NVMe, GeForce RTX 4070. Display 15.6" OLED 3.5K touch.',2950,10),
      ('computer',3,'Lenovo Legion Pro 5 RTX 4070','Ryzen 7 7745HX, RTX 4070 8GB, 32GB DDR5, 1TB SSD. Display 16" WQXGA 240Hz. Gaming laptop top-tier.',2150,10),
      ('computer',4,'ASUS ROG Zephyrus G14 OLED','Ryzen 9 8945HS, RTX 4070, 32GB LPDDR5X, 1TB PCIe 4. Display 14" OLED 3K 120Hz. Portable gaming flagship.',2350,10),
      ('computer',5,'MacBook Air M3 15" 24/1TB','Apple M3 10-core GPU, 24GB unified, 1TB SSD. Liquid Retina 15.3". Midnight finish, notebook premium.',2150,10),
      ('computer',6,'HP Spectre x360 16 i7 OLED','Intel Core i7-13700H Ultra, 32GB LPDDR4x, 1TB SSD, OLED 3K touch convertible. Penna inclusa.',2450,10),
      ('computer',7,'Framework Laptop 16 Ryzen 9','Ryzen 9 7940HS, Radeon RX 7700S modulare, 32GB, 2TB. Modulare e upgradeable. DIY pro setup.',2750,10),
      ('computer',8,'Microsoft Surface Laptop Studio 2','Core i7-13700H, RTX 4060, 32GB, 1TB. Display 14.4" PixelSense 120Hz pieghevole stage mode.',3250,10),

      -- GAMING (block=10)
      ('gaming',1,'PlayStation 5 Pro Digital Edition','Console Pro ultima generazione, 2TB SSD NVMe, GPU 2x potenza PS5 standard, PSSR upscaling AI, 8K ready.',750,10),
      ('gaming',2,'Xbox Series X 1TB + 2 Controller','Console flagship Microsoft, 1TB NVMe, 12TFLOPS RDNA2, 4K 120Hz, Quick Resume. 2 Elite Series 2 inclusi.',850,10),
      ('gaming',3,'Nintendo Switch OLED Collector + 10 Giochi','Switch OLED + 10 giochi AAA (Zelda TOTK, Mario Wonder, Splatoon 3, Metroid Prime Remastered, Pokemon). Bundle completo.',650,10),
      ('gaming',4,'ASUS ROG Ally X 1TB','Handheld gaming premium, Ryzen Z1 Extreme, 24GB LPDDR5X, 1TB. Display 7" FHD 120Hz VRR.',950,10),
      ('gaming',5,'Steam Deck OLED 1TB + Dock','HDR OLED 7.4" 90Hz, 1TB NVMe, Dock Ufficiale Valve. Setup Steam gaming completo portable.',750,10),
      ('gaming',6,'Meta Quest 3 512GB + Elite Strap + Touch Pro','VR flagship standalone, Snapdragon XR2+ Gen 2, display 4K+ per occhio, controller Touch Pro. Bundle pro.',650,10),
      ('gaming',7,'PlayStation VR2 + Horizon Call Bundle','PSVR2 headset HDR OLED 4K, Sense Controller haptic, gioco Horizon Call of the Mountain. Plus 3 giochi.',850,10),
      ('gaming',8,'Razer Blade 16 OLED 240Hz','Intel Core i9-14900HX, RTX 4090 16GB, 32GB DDR5, 2TB. Display 16" OLED 240Hz. Gaming laptop top.',3250,10),

      -- AUDIO (block=5)
      ('audio',1,'Sony WH-1000XM5 + Shure SRH1840 Bundle','Coppia cuffie hi-end: WH-1000XM5 wireless ANC + SRH1840 reference studio open-back. Setup audiophilo completo.',950,5),
      ('audio',2,'Bose QC Ultra + Soundbar 900 Bundle','Cuffie Bose QuietComfort Ultra + Soundbar Bose 900 con Dolby Atmos. Home cinema premium.',1450,5),
      ('audio',3,'Apple AirPods Max + HomePod 2 + AirPods Pro 2','Ecosystem audio Apple completo: over-ear, smart speaker, in-ear. Spatial Audio personalizzato.',1150,5),
      ('audio',4,'Bowers & Wilkins Px8 McLaren Edition','Edizione speciale in pelle nappa arancione McLaren. Drivers Carbon Cone, ANC adaptivo. Premium flagship.',850,5),
      ('audio',5,'Sennheiser HD 800S Reference Audiophile','Cuffie aperte reference professionali, driver ring radiator 56mm, impedenza 300Ω. Audiophile top.',1450,5),
      ('audio',6,'Sony HT-A9 4.0.4 Home Cinema Wireless','4 diffusori wireless sincronizzati, 360 Spatial Sound Mapping, IMAX Enhanced, Dolby Atmos.',1850,5),
      ('audio',7,'Focal Bathys Wireless Bluetooth aptX','Cuffie wireless francesi premium, driver alluminio/magnesio, ANC, 30h autonomia, USB DAC integrato.',850,5),
      ('audio',8,'Audeze LCD-X Planar Magnetic Creator','Driver planari magnetici 106mm, studio reference, cavo bilanciato XLR 4-pin + custodia roadready.',1250,5),

      -- FOTOGRAFIA (block=10)
      ('fotografia',1,'Sony Alpha 7R V + FE 24-105 f/4 G','Mirrorless full-frame 61MP, AI autofocus real-time, 8K video. Kit completo corpo + zoom standard.',4850,10),
      ('fotografia',2,'Canon EOS R5 Mark II + RF 70-200 f/2.8','45MP stacked sensor, 8K RAW, Dual Pixel CMOS AF II. Kit con telezoom L-series professional.',6850,10),
      ('fotografia',3,'Nikon Z8 + Z 24-70 f/2.8 S','Mirrorless FX 45.7MP stacked, 8K/60p, Z-mount premium. Il flagship Nikon compatto.',5450,10),
      ('fotografia',4,'Fujifilm X-H2S + XF 16-55 f/2.8','APS-C stacked 26MP, 6.2K video, 40fps burst. Kit pro con trinity zoom grandangolare.',3250,10),
      ('fotografia',5,'Leica Q3 60MP Fixed Lens','Full-frame 60MP, Summilux 28mm f/1.7 ASPH integrato, 8K video, design iconico Leica.',5850,10),
      ('fotografia',6,'Panasonic Lumix S5 IIX + 50 f/1.8','Full-frame 24MP PDAF, 6K video ProRes RAW, kit con 50 f/1.8 S-Line.',2850,10),
      ('fotografia',7,'GoPro HERO12 Black Creator Kit','5.3K60 + 4K120, HyperSmooth 6.0, bundle con batterie extra, Max Lens Mod 2.0, treppiedi.',850,10),
      ('fotografia',8,'DJI Ronin 4D 6K + Kit Pro','Cinema camera integrata 6K con gimbal 4-axis, 4D LiDAR focus, kit completo pro.',7850,10),

      -- OROLOGI (block=15)
      ('orologi',1,'Rolex Submariner Date 41mm Oyster Steel','Ref. 126610LN, cal. 3235 Superlative Chronometer, ghiera Cerachrom, garanzia Rolex 5 anni attiva.',14500,15),
      ('orologi',2,'Omega Speedmaster Moonwatch Sapphire','Ref. 310.30.42.50.01.002, cal. 3861 Co-Axial Master Chronometer, vetro zaffiro, NASA certified.',6850,15),
      ('orologi',3,'Tudor Black Bay 58 925 Silver','Ref. 79010SG, cal. MT5400, cassa argento 925 925‰, 200m WR, bracciale argento massiccio.',4250,15),
      ('orologi',4,'IWC Pilot Mark XX Spitfire Bronze','Ref. IW328204, cal. 82100, bronzo tropicale, WR 100m, design Spitfire RAF. Box & papers.',5850,15),
      ('orologi',5,'Breitling Navitimer B01 46 Green','Ref. AB0137241L1P1, cal. B01 manufacture chronograph, slide rule classico, quadrante verde.',8850,15),
      ('orologi',6,'Panerai Luminor Marina 44mm Blue','Ref. PAM01313, cal. P.9010 automatic, 3 giorni riserva di carica, lunette sandwich iconica.',7850,15),
      ('orologi',7,'TAG Heuer Monaco Calibre 11 Blu','Ref. CAW211P.FC6356, cal. 11 automatic chronograph, Steve McQueen tribute, cassa quadrata iconica.',6250,15),
      ('orologi',8,'Grand Seiko SBGA413 Shunbun Spring Drive','Cal. 9R65 Spring Drive (±1s/day), quadrante cherry blossom, zaratsu polishing. Edizione primavera.',5450,15),

      -- GIOIELLI (block=15)
      ('gioielli',1,'Cartier LOVE Bracelet 18K Oro Rosa','Design iconico Aldo Cipullo 1969, oro rosa 18kt, cacciavite incluso, garanzia Cartier attiva.',7450,15),
      ('gioielli',2,'Tiffany & Co Elsa Peretti Diamond Pendant','Diamante 0.17ct VS, montatura platino, collana 41cm Tiffany box & dust bag.',2850,15),
      ('gioielli',3,'Bulgari Serpenti Viper Anello Oro Rosa','Oro rosa 18kt, design serpente iconico, taglia regolabile, box Bulgari.',4850,15),
      ('gioielli',4,'Van Cleef Alhambra 20 Motif Madreperla','Collana 20 motivi Magic Alhambra, oro giallo 18kt, madreperla bianca, pietra fortuna iconica.',6250,15),
      ('gioielli',5,'Boucheron Quatre Classique Anello','Oro rosa 18kt, 4 righe distintive, diamanti pavé, collection iconica Place Vendôme.',3850,15),
      ('gioielli',6,'Damiani Belle Époque Reel Collana','Oro bianco 18kt, diamanti 0.35ct, design vintage anni 20, Italian craftsmanship.',2450,15),
      ('gioielli',7,'Pomellato Nudo Quarzo Rosa Anello','Oro rosa 18kt, quarzo rosa taglio smeraldo, collection Nudo cult Pomellato.',1850,15),
      ('gioielli',8,'Chopard Happy Diamonds Icons Anello','Oro rosa 18kt, 5 diamanti mobili 0.33ct, collection Happy Diamonds iconica.',2150,15),

      -- BORSE (block=15)
      ('borse',1,'Louis Vuitton Keepall 55 Monogram','Classico travel bag Monogram canvas, cuoio naturale vachetta, dimensioni 55×31×25cm.',1850,15),
      ('borse',2,'Hermès Garden Party 36 Toile/Pelle','Canvas toile H + pelle negonda, 36cm, manico top, condizioni nuove, come da boutique.',2450,15),
      ('borse',3,'Chanel Classic Flap Medium Caviar','Pelle caviar nera, hardware oro, tracolla chain Mademoiselle, box & dust bag.',8850,15),
      ('borse',4,'Dior Saddle Bag Oblique Jacquard','Iconic re-edition John Galliano, canvas Oblique, hardware gold antico, tracolla.',3450,15),
      ('borse',5,'Prada Galleria Saffiano Large','Pelle Saffiano nera, 3 scomparti, tracolla removibile, P-Logo metallico.',2850,15),
      ('borse',6,'Gucci GG Marmont Matelassé','Pelle matelassé chevron, fibbia GG oversize gold, tracolla in catena.',2250,15),
      ('borse',7,'Bottega Veneta Cassette Padded Intrecciato','Intrecciato iconico morbido, pelle nappa, tracolla catena oro, design Daniel Lee.',2650,15),
      ('borse',8,'Celine Triomphe Canvas Beige','Canvas Triomphe logo + pelle vitello, hardware brass, iconic Hedi Slimane design.',2950,15),

      -- MODA (block=10)
      ('moda',1,'Moncler Maya Down Jacket Navy','Piumino iconico Moncler in Grenoble, piuma 90/10, logo patch, stagione FW attuale.',1550,10),
      ('moda',2,'Brunello Cucinelli Cashmere Cardigan','100% cashmere Mongolian, finiture artigianali italiane, lavorazione made in Italy premium.',2450,10),
      ('moda',3,'Tom Ford Atticus Tuxedo Suit','Tuxedo Atticus O''Connor wool silk blend, sartoria italiana, peaked lapel satin.',3850,10),
      ('moda',4,'Balenciaga Triple S Clear Sole','Sneakers iconiche Demna Gvasalia, misura 42/43, box & papers originali.',950,10),
      ('moda',5,'Off-White Diagonal Stripe Hoodie Set','Set hoodie + pantalone archive Virgil Abloh, diagonal stripes iconic, misura L.',1250,10),
      ('moda',6,'Isabel Marant Silver Sequin Dress','Abito paillettes argento, festive collection, misura 38, boho-chic signature.',1350,10),
      ('moda',7,'Etro Paisley Silk Shirt Set','3 camicie seta paisley, archive pattern italian heritage, taglia 40/42 IT.',850,10),
      ('moda',8,'Loro Piana Cashmere Coat Camel','Cappotto cashmere beige cammello, sartoria italiana, baby cashmere 100% Loro Piana.',4850,10),

      -- BICICLETTE (block=15)
      ('biciclette',1,'Specialized Turbo Vado SL 5.0 E-Bike','E-bike ibrida SL motor 240W, batteria 320Wh, 70km autonomia, gruppo Shimano Deore 11v.',4850,15),
      ('biciclette',2,'Trek Domane SLR 9 Carbon Road','Telaio OCLV 800 carbon, SRAM Red eTap AXS 12v, ruote Bontrager Aeolus RSL 51.',7250,15),
      ('biciclette',3,'Cannondale Topstone Neo Carbon','Gravel e-bike carbon, motor Bosch Performance Line CX, batteria 500Wh, SRAM Force.',5850,15),
      ('biciclette',4,'Bianchi Oltre XR4 Disc Campagnolo','Celeste iconico, telaio carbon racing, Campagnolo Super Record EPS, Fulcrum Racing Zero.',8450,15),
      ('biciclette',5,'Giant Revolt Advanced Pro 0','Gravel carbon flagship, SRAM Force XPLR AXS, ruote CADEX 42 Carbon, D-Fuse.',3850,15),
      ('biciclette',6,'Canyon Grail CF SL 8 Di2','Gravel carbon, Shimano GRX Di2, doppia borraccia, comfort + speed combination.',3450,15),
      ('biciclette',7,'Cervelo Caledonia-5 Ultegra Di2','Endurance race carbon, Shimano Ultegra Di2 12v, ruote Reserve 44/58 Carbon.',6850,15),
      ('biciclette',8,'Pinarello Dogma F12 Disk Vincitore Tour','Telaio carbon Torayca T1100, Shimano Dura-Ace Di2, Most ruote Carbon disc.',10850,15),

      -- ARREDAMENTO (block=10)
      ('arredamento',1,'Kartell Louis Ghost 4 Sedie + Tavolo Invisible','Philippe Starck design, 4 sedie Louis Ghost + 1 tavolo Invisible 80cm policarbonato.',1850,10),
      ('arredamento',2,'B&B Italia Charles Sofa 3-Seats','Antonio Citterio design, pelle full grain, struttura metallo verniciato, made in Italy.',4850,10),
      ('arredamento',3,'Flos Arco Lampada Design','Lampada iconica Castiglioni Flos, base marmo Carrara, asta acciaio cromato, paralume alluminio.',2450,10),
      ('arredamento',4,'Eames Lounge Chair + Ottoman Herman Miller','Iconic Charles & Ray Eames 1956, palissandro Santos, pelle aniline, original Herman Miller.',5850,10),
      ('arredamento',5,'Poliform Bristol Poltrona Cashmere','Jean-Marie Massaud design, rivestimento cashmere avorio, struttura noce canaletto.',3250,10),
      ('arredamento',6,'Cassina LC4 Chaise Lounge Corbusier','Le Corbusier icon 1928, pelle cavallino nero bianco, struttura acciaio cromato.',5450,10),
      ('arredamento',7,'Artemide Tolomeo Lampade Set 4','Set 4 lampade Tolomeo Mega/Parete/Terra/Tavolo, alluminio brillantato, Michele De Lucchi.',1150,10),
      ('arredamento',8,'Gervasoni Ghost Bed Queen Size','Paola Navone design, testata e pediera rivestite in lino washed, comfort assoluto.',2850,10),

      -- SPORT (block=10)
      ('sport',1,'Peloton Bike+ All Access Bundle','Peloton Bike+ rotante, schermo 24" HD, cuffie + cardio + scarpe Delta-compatible + 1 anno All-Access.',2850,10),
      ('sport',2,'NordicTrack X32i Incline Trainer','Tapis roulant inclinable ±40°, schermo 32" HD touch, iFit Pro 3 anni, velocità 20 km/h.',4250,10),
      ('sport',3,'Dyson Supersonic + Tecnogym Wellness Kit','Bundle lifestyle: phon Dyson Supersonic + Tecnogym kit dumbbell + tappetino + foam roller.',1450,10),
      ('sport',4,'Salomon MTN Lab Ski + Boots + Skins','Set skialpinismo pro: sci Salomon MTN Lab 86 + scarponi S/Lab MTN + pelli foca tagliate.',1850,10),
      ('sport',5,'Callaway Paradym Ai Smoke Golf Set','Set 14 mazze completo: driver Ai Smoke + legni + ibridi + ferri + wedges + putter + sacca.',2450,10),
      ('sport',6,'Wilson Pro Staff RF97 Federer Kit','3 racchette Pro Staff RF97 Autograph + borsa Federer + incordaggio Luxilon 4G pro.',850,10),
      ('sport',7,'Head Graphene 360+ Radical Pro Kit','2 racchette Radical Pro tour + borsa 9R + 3 tubi palle pressurizzate + overgrip.',1250,10),
      ('sport',8,'Atomic Redster G9 Race Ski Kit','Sci slalom gigante FIS length 191cm, attacchi X16 VAR, scarponi Hawx Ultra 130 S.',1850,10),

      -- STRUMENTI (block=15)
      ('strumenti',1,'Fender Stratocaster American Ultra HSS','Manico Modern D, pickup Ultra Noiseless V-Mod II, finitura Mocha Burst, case Elite.',2450,15),
      ('strumenti',2,'Gibson Les Paul Standard 60s Heritage','Tabacco Burst, Burstbuckers 61R/T, tastiera ebano, hardware cromato nickel.',3250,15),
      ('strumenti',3,'Yamaha C7X Grand Piano Concert','Coda gran concerto 227cm, polished ebony, selected by artists. Box originale Yamaha.',18450,15),
      ('strumenti',4,'Nord Stage 4 88 Performance Keyboard','Nord Lead A1 synth + Piano + Organ sections, 88 hammer keys, velvet touch. Flagship.',4850,15),
      ('strumenti',5,'Moog One 16 Voice Analog Synthesizer','Polyphonic analog 16 voci, 3 VCO per voce, 4 LFO, Fatar keybed. Moog flagship.',9850,15),
      ('strumenti',6,'Martin D-45 Reimagined Acoustic','Dreadnought 14-fret, Sitka spruce top, East Indian rosewood, abalone binding.',12450,15),
      ('strumenti',7,'Roland V-Drums TD-50KV2 Premium Kit','Set TD-50X module, pad mesh PD-140DS, VH-14D hi-hat. Studio pro kit.',6850,15),
      ('strumenti',8,'Taylor 914ce V-Class Acoustic-Electric','Grand Auditorium, Sitka + Indian rosewood, V-Class bracing, ES2 electronics.',5850,15),

      -- ARTE (block=20)
      ('arte',1,'Banksy Original Signed Print Numbered Girl w Balloon','Stampa numerata 25/500, firmata Banksy, certificato Pest Control, cornice museum.',14450,20),
      ('arte',2,'Andy Warhol Marilyn Screenprint Authenticated','Serigrafia firmata retro, edizione limitata autenticata Warhol Foundation.',22450,20),
      ('arte',3,'Fontana Concetto Spaziale Original Print','Lucio Fontana, stampa originale numerata, archivio Fontana certificate.',8850,20),
      ('arte',4,'Fondazione Arnaldo Pomodoro Sfera 40cm','Sfera Pomodoro Arnaldo bronzo patinato 40cm, edizione firmata, Fondazione cert.',18850,20),
      ('arte',5,'Collezione Moneta Romana Imperiale Set 12','12 monete romane imperiali argento/oro, certificato numismatico AMIS, custodia museo.',6850,20),
      ('arte',6,'Keith Haring Barking Dog Original Signed','Stampa originale firmata, 1985, provenienza documentata. Keith Haring Foundation.',11850,20),
      ('arte',7,'Damien Hirst Spot Print Signed Numbered','Serigrafia 85/100, firmata, certificato Science Ltd, colori originali.',9250,20),
      ('arte',8,'Takashi Murakami Flower Print Signed','Stampa firmata edizione limitata, Kaikai Kiki cert, flower smile icon.',7850,20),

      -- VINO (block=20)
      ('vino',1,'Sassicaia 2019 Cassa 6 bottiglie OC','Tenuta San Guido Bolgheri, annata top, cassa 6×0.75l original box, cantina climatizzata.',2850,20),
      ('vino',2,'Masseto 2020 Bottiglia 0.75l OC','Merlot 100% Tenuta Masseto Ornellaia, annata eccezionale, 100 punti Wine Advocate.',2650,20),
      ('vino',3,'Dom Pérignon P2 2004 Bottiglia','Plénitude 2 2004, sboccato 2020, champagne gran prestige. Box ufficiale Moët.',1850,20),
      ('vino',4,'Château Latour 2015 Cassa 6 OC','Premier Grand Cru Classé Pauillac, annata 100 punti, original wood case, perfetta conservazione.',9850,20),
      ('vino',5,'Romanée-Conti La Tâche 2019 Bottiglia','Grand Cru Domaine de la Romanée-Conti, annata ricercata, certificato DRC.',14850,20),
      ('vino',6,'Opus One 2019 Cassa 6 OC','Mondavi-Rothschild Napa, Bordeaux blend top, cassa legno originale 6 bottiglie.',4850,20),
      ('vino',7,'Ornellaia Verticale 2015-2019 5 Annate','5 bottiglie Ornellaia annate consecutive 2015/16/17/18/19, confezione speciale.',3250,20),
      ('vino',8,'Gaja Barbaresco 2019 Cassa 12 OC','Barbaresco DOCG Angelo Gaja, annata 5 stelle, original wood case 12 bottiglie.',3850,20)
    ) AS t(category,idx,title,description,desired,block_price_aria)
    ORDER BY category, idx
  LOOP
    v_block_price := v_r.block_price_aria;
    v_presale_price := GREATEST(1, v_block_price - 1);

    -- Photo mapping: usa foto reali del progetto quando esistenti, altrimenti Picsum seeded
    v_photo := CASE v_r.category
      WHEN 'smartphone' THEN '/public/images/airdrop_iphone16promax.jpg'
      WHEN 'gaming' THEN '/public/images/airdrop_ps5pro.jpg'
      WHEN 'orologi' THEN '/public/images/airdrop_rolex_datejust36.jpg'
      WHEN 'borse' THEN '/public/images/airdrop_lv_keepall55.jpg'
      WHEN 'audio' THEN '/public/images/airdrop_airpods_pro.png'
      ELSE 'https://picsum.photos/seed/airoobi-'||v_r.category||'-'||v_r.idx||'/800/600'
    END;

    -- Primi 3 idx → in_valutazione, 4-8 → presale
    IF v_r.idx <= 3 THEN
      v_status := 'in_valutazione';
      v_object_value := 0;
      v_total_blocks := 0;
    ELSE
      v_status := 'presale';
      -- Quotazione AIROOBI: mid-point tra min e desired
      v_object_value := v_r.desired - 125;
      -- N° blocchi: ceil(value / (block_price × 0.10))
      v_total_blocks := CEIL(v_object_value / (v_block_price * 0.10))::integer;
    END IF;

    -- Insert airdrop
    IF v_status = 'in_valutazione' THEN
      INSERT INTO airdrops (
        title, description, category, image_url,
        seller_desired_price, seller_min_price,
        object_value_eur, block_price_aria, total_blocks,
        status, submitted_by, duration_type, product_info
      ) VALUES (
        v_r.title, v_r.description, v_r.category, v_photo,
        v_r.desired, v_r.desired - 250,
        0, 0, 0,
        'in_valutazione', v_ceo, 'standard',
        jsonb_build_object('bulk_populate', true, 'populate_date', '2026-04-22')
      ) RETURNING id INTO v_airdrop_id;
    ELSE
      INSERT INTO airdrops (
        title, description, category, image_url,
        seller_desired_price, seller_min_price,
        object_value_eur, block_price_aria, total_blocks, blocks_sold,
        presale_block_price, presale_enabled, presale_blocks_pct,
        deadline, duration_type, auto_draw,
        status, submitted_by, product_info
      ) VALUES (
        v_r.title, v_r.description, v_r.category, v_photo,
        v_r.desired, v_r.desired - 250,
        v_object_value, v_block_price, v_total_blocks, 0,
        v_presale_price, true, 10,
        now() + interval '7 days', 'standard', true,
        'presale', v_ceo,
        jsonb_build_object('bulk_populate', true, 'populate_date', '2026-04-22')
      ) RETURNING id INTO v_airdrop_id;
    END IF;

    -- Decurta 50 ARIA dal CEO
    UPDATE profiles SET total_points = total_points - 50 WHERE id = v_ceo;
    INSERT INTO points_ledger (user_id, amount, reason, metadata)
    VALUES (v_ceo, -50, 'valuation_request',
      jsonb_build_object('airdrop_id', v_airdrop_id, 'bulk_populate', true));

    -- Accredita 50 ARIA al conto AIROOBI
    INSERT INTO platform_aria_ledger (amount, reason, related_airdrop_id, related_user_id, metadata)
    VALUES (50, 'valuation_fee', v_airdrop_id, v_ceo,
      jsonb_build_object('title', v_r.title, 'category', v_r.category, 'bulk_populate', true));

    v_seq := v_seq + 1;
  END LOOP;

  RAISE NOTICE 'Bulk populate completato: % airdrop creati', v_seq;
END$$;
