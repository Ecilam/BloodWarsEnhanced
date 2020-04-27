  var fixLvls = [ 20200224, // version
// vérifiés
  1000, // 1
  1100,
  1211,
  1332,
  1465,
  1611,
  1772,
  1949,
  2144,
  2358,
  2594,
  2854,
  3139,
  3453,
  3798,
  4178,
  4595,
  5055,
  5560,
  6116, // 20
  6728,
  7401,
  8141,
// à vérifier  
  8955, // 24
  9850,
  10835,
  11919,
  13110,
  14421,
  15864, // 30
  17450,
  19195,
  21114,
  23226,
  25548,
  28103,
  30913,
  34004,
  37405,
  41145, // 40
  45260,
  49786,
  54764,
  60241,
  66265,
  72891,
  80180,
  88198,
  97018,
  106719, // 50
  117391,
  129130,
  142043,
  156248,
  171872,
  189060,
  207966,
  228762,
  251638,
  276802, // 60
  304482,
  334930,
  368423,
  405266,
  445792,
  490371,
  539408,
  593349,
  652684,
  717952, // 70
  789747,
  868722,
  955594,
  1051154,
  1156269,
  1271896,
  1399085,
  1538994,
  1692893, // vérifié
  1862183, // 80
  2048401,
  2253241,
  2478565,
  2726421,
  2999063,
  3298970,
  3628866,
  3991753,
  4390928,
  4830021, // 90
  5313023,
  5844325,
  6428758,
  7071634,
  7778797,
  8556677, // vérifié
  9412344,
  10353579,
// vérifiés sinon 0
  11388936,
  12527830, // 100
  13700890,
  14908356, 
  16150458,
  17427469,
  18739603,
  20087116,
  21470256,
  22889272,
  24344415,
  25836938, // 110
  27364096,
  28929145,
  30531344,
  32170953,
  33848233,
  35563448,
  37316864,
  39108748,
  40939369,
  42808999, // 120
  44717911,
  46666380,
  48654682,
  50683096,
  52751903,
  54861386,
  57011830,
  59203521,
  61436748,
  63711802, // 130
  66028976,
  68388564,
  70790863,
  73236000,
  75724792,
  78257026,
  80833180,
  83453561,
  86118479,
  88828246, // 140
  91583175,
  94383583,
  97229788,
  100122111,
  103060874,
  106046402,
  109079023,
  112159066,
  115286863,
  118462749, // 150
  121687060,
  124960135,
  128282316,
  131653946,
  135074371,
  138546940,
  142069004,
  145641917,
  149266034,
  152941714, // 160
  156669318,
  160449209,
  164281753,
  168167319,
  172106278,
  176099004,
  180145873,
  184247264,
  188403559,
  192615142, // 170
  196882400,
  201205723,
  205585503,
  210022135,
  214516017,
  219067550,
  223677138,
  228345187,
  233072106,
  237858307, // 180
  242704205,
  247610218,
  252576757,
  257604276,
  262693172,
  267843884,
  273056845,
  278332491,
  283671260,
  289073594, // 190 
  294539938,
  300070740,
  305666452,
  311327528,
  317054425,
  322847604,
  328707529,
  334634667,
  340629489,
  346692469, // 200
  352824084,
  359024814,
  365295143,
  371635558,
  378046550,
  384528613,
  391082244,
  397707944,
  404406218,
  411177574, // 210
  418022523,
  424941581,
  431935266,
  439004101,
  446148612,
  453369328,
  460666783,
  468041514,
  475494062,
  483024972, // 220
  490634792,
  498324075,
  506093377,
  513943258,
  521874282,
  529887017,
  537982035,
  546159912,
  554421228,
  562766567, // 230
  571196517,
  579711670,
  588312623,
  596999976,
  605774334,
  614636306,
  623586506,
  632625551,
  641754063,
  650972668, // 240
  660281997,
  669682685,
  679175372,
  688760702,
  698439323,
  708211888,
  718079055,
  728041486,
  738099848,
  748254812, // 250
  758507055,
  768857257,
  779306104,
  789854287,
  800502501,
  811251446,
  822101827,
  833054354,
  844109742,
  855268711, // 260
  866531987,
  877900300,
  889374385,
  900954982,
  912642837,
  924438701,
  936343330,
  948357485,
  960481933,
  972717446, // 270
  985064801,
  997524781,
  1010098175,
  1022785776,
  1035588384,
  1048506804,
  1061541847,
  1074694329,
  1087965072,
  1101354904, // 280
  1114864658,
  1128495174,
  1142247297,
  1156121879,
  1170119777,
  1184241854,
  1198488979,
  1212862028,
  1227361882,
  1241989429, // 290
  1256745562,
  1271631182,
  1286647195,
  1301794514,
  1317074058,
  1332486752,
  1348033528,
  1363715325,
  1379533088,
  1395487769, // 300
  1411580326,
  1427811724,
  1444182935,
  1460694938,
  1477348719,
  1494145270,
  1511085590,
  1528170686,
  1545401571,
  1562779266, // 310
  1580304798,
  1597979202,
  1615803520,
  1633778802,
  1651906105,
  1670186493,
  1688621037,
  1707210816,
  1725956917,
  1744860434, // 320
  1763922469,
  1783144132,
  1802526540,
  1822070818,
  1841778099,
  1861649524,
  1881686243,
  1901889413,
  1922260199,
  1942799774, // 330
  1963509320,
  1984390026,
  2005443090,
  2026669719,
  2048071128,
  2069648540,
  2091403187,
  2113336310,
  2135449158,
  2157742989, // 340
  2180219070,
  2202878677,
  2225723095,
  2248753617,
  2271971546,
  2295378194,
  2318974882,
  2342762940,
  2366743708,
  2390918535, // 350 
  2415288779,
  2439855808,
  2464621000,
  2489585742,
  2514751431,
  2540119473,
  2565691285,
  2591468293,
  2617451933,
  2643643652, // 360
  2670044906,
  2696657162,
  2723481897,
  2750520599,
  2777774765,
  2805245904,
  2832935534,
  2860845185,
  2888976397,
  2917330721]; //370
