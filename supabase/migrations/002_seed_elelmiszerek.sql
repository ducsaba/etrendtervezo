-- Magyar élelmiszer alap adatok (felhaszt_id = NULL = közös)
INSERT INTO elelmiszerek (nev, kategoria, kaloria_100g, feherje_g, szenhidrat_g, zsir_g, rost_g) VALUES
-- Húsok
('Csirkemell', 'hus', 165, 31, 0, 3.6, 0),
('Csirkecomb', 'hus', 215, 26, 0, 12, 0),
('Sertéskaraj', 'hus', 242, 27, 0, 15, 0),
('Darált marhahús (sovány)', 'hus', 215, 26, 0, 12, 0),
('Tonhalkonzerv (sós lében)', 'hus', 116, 26, 0, 0.8, 0),
('Lazac', 'hus', 208, 20, 0, 13, 0),
('Tojás (egész)', 'tejtermek', 155, 13, 1.1, 11, 0),
('Tojásfehérje', 'tejtermek', 52, 11, 0.7, 0.2, 0),

-- Tejtermékek
('Görög joghurt (2%)', 'tejtermek', 73, 10, 4, 2, 0),
('Túró (sovány)', 'tejtermek', 86, 14, 3.4, 1, 0),
('Sajt (trappista)', 'tejtermek', 356, 28, 0, 27, 0),
('Tej (2,8%)', 'tejtermek', 52, 3.4, 4.8, 2.8, 0),
('Tejföl (20%)', 'tejtermek', 195, 2.7, 3.4, 19, 0),

-- Gabonák, kenyér
('Teljes kiőrlésű kenyér', 'gabona', 247, 9, 43, 3.4, 6),
('Fehér kenyér', 'gabona', 265, 9, 49, 3.2, 2.7),
('Zabpehely', 'gabona', 389, 17, 66, 7, 11),
('Barna rizs (főtt)', 'gabona', 123, 2.7, 26, 1, 1.8),
('Fehér rizs (főtt)', 'gabona', 130, 2.7, 28, 0.3, 0.4),
('Tészta (főtt)', 'gabona', 131, 5, 25, 1.1, 1.8),
('Teljes kiőrlésű tészta (főtt)', 'gabona', 124, 5.3, 23, 1.1, 3.4),

-- Zöldségek
('Paradicsom', 'zoldseg', 18, 0.9, 3.9, 0.2, 1.2),
('Uborka', 'zoldseg', 15, 0.7, 3.6, 0.1, 0.5),
('Paprika (piros)', 'zoldseg', 31, 1, 6, 0.3, 2.1),
('Sárgarépa', 'zoldseg', 41, 0.9, 10, 0.2, 2.8),
('Brokkoli', 'zoldseg', 34, 2.8, 7, 0.4, 2.6),
('Spenót', 'zoldseg', 23, 2.9, 3.6, 0.4, 2.2),
('Saláta (fejes)', 'zoldseg', 15, 1.4, 2.9, 0.2, 1.3),
('Burgonya (főtt)', 'zoldseg', 87, 1.9, 20, 0.1, 1.8),
('Édesburgonya (főtt)', 'zoldseg', 86, 1.6, 20, 0.1, 3),
('Hagyma', 'zoldseg', 40, 1.1, 9.3, 0.1, 1.7),
('Fokhagyma', 'zoldseg', 149, 6.4, 33, 0.5, 2.1),
('Gomba', 'zoldseg', 22, 3.1, 3.3, 0.3, 1),
('Zöldbab', 'zoldseg', 31, 1.8, 7, 0.1, 2.7),
('Karfiol', 'zoldseg', 25, 1.9, 5, 0.3, 2),
('Cukkini', 'zoldseg', 17, 1.2, 3.1, 0.3, 1),

-- Gyümölcsök
('Alma', 'gyumolcs', 52, 0.3, 14, 0.2, 2.4),
('Banán', 'gyumolcs', 89, 1.1, 23, 0.3, 2.6),
('Narancs', 'gyumolcs', 47, 0.9, 12, 0.1, 2.4),
('Szőlő', 'gyumolcs', 67, 0.6, 17, 0.4, 0.9),
('Eper', 'gyumolcs', 32, 0.7, 7.7, 0.3, 2),
('Áfonya', 'gyumolcs', 57, 0.7, 14, 0.3, 2.4),
('Körte', 'gyumolcs', 57, 0.4, 15, 0.1, 3.1),

-- Zsírok, olajok
('Olívaolaj', 'zsirok', 884, 0, 0, 100, 0),
('Napraforgóolaj', 'zsirok', 884, 0, 0, 100, 0),
('Vaj', 'zsirok', 717, 0.9, 0.1, 81, 0),

-- Hüvelyesek
('Lencse (főtt)', 'huvelyesek', 116, 9, 20, 0.4, 7.9),
('Csicseriborsó (főtt)', 'huvelyesek', 164, 8.9, 27, 2.6, 7.6),
('Bab (főtt)', 'huvelyesek', 127, 8.7, 23, 0.5, 6.4),

-- Olajos magvak
('Dió', 'magvak', 654, 15, 14, 65, 6.7),
('Mandula', 'magvak', 579, 21, 22, 50, 12.5),
('Napraforgómag', 'magvak', 584, 21, 20, 51, 8.6),
('Mogyoróvaj (natúr)', 'magvak', 588, 25, 20, 50, 6),

-- Magyar ételek (becsült 100g-ra)
('Gulyásleves', 'magyar', 65, 5, 5, 3, 0.8),
('Töltött káposzta', 'magyar', 158, 10, 8, 10, 1.5),
('Csirkepaprikás (galuskával)', 'magyar', 180, 14, 12, 9, 0.5),
('Lecsó', 'magyar', 55, 2, 6, 3, 1.5),
('Rakott krumpli', 'magyar', 145, 7, 13, 8, 1.2),
('Rántott hús (sertés)', 'magyar', 285, 19, 14, 17, 0.5),
('Lángos (sima)', 'magyar', 290, 7, 43, 10, 1.2),
('Palacsinta (sima)', 'magyar', 210, 7, 30, 7, 0.8),
('Tejbegríz', 'magyar', 110, 4, 18, 3, 0.2),

-- Italok
('Kávé (fekete)', 'ital', 2, 0.3, 0, 0, 0),
('Tej (1,5%)', 'tejtermek', 46, 3.3, 4.8, 1.5, 0),
('Narancslé (100%)', 'ital', 45, 0.7, 10, 0.2, 0.2);
