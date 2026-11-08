# English keyword -> (category slug, Portuguese noun, grammatical gender)
# Order matters: first match wins, so specific terms come before generic ones.
SUBJECTS = [
  # Brazilian / jungle animals
  ("capybara","animais-brasileiros","Capivara","f"),("toucan","animais-brasileiros","Tucano","m"),("sloth","animais-brasileiros","Bicho-preguiça","m"),
  ("macaw","animais-brasileiros","Arara","f"),("parrot","passaros","Papagaio","m"),("jaguar","animais-brasileiros","Onça","f"),("armadillo","animais-brasileiros","Tatu","m"),
  ("anteater","animais-brasileiros","Tamanduá","m"),("alligator","animais-brasileiros","Jacaré","m"),("crocodile","animais-brasileiros","Crocodilo","m"),("tapir","animais-brasileiros","Anta","f"),
  ("hummingbird","passaros","Beija-flor","m"),("llama","animais","Lhama","f"),("alpaca","animais","Alpaca","f"),
  ("lion","animais-da-selva","Leão","m"),("tiger","animais-da-selva","Tigre","m"),("elephant","animais-da-selva","Elefante","m"),("giraffe","animais-da-selva","Girafa","f"),
  ("zebra","animais-da-selva","Zebra","f"),("monkey","animais-da-selva","Macaco","m"),("gorilla","animais-da-selva","Gorila","m"),("chimp","animais-da-selva","Chimpanzé","m"),
  ("hippo","animais-da-selva","Hipopótamo","m"),("rhino","animais-da-selva","Rinoceronte","m"),("leopard","animais-da-selva","Leopardo","m"),("cheetah","animais-da-selva","Guepardo","m"),
  ("kangaroo","animais","Canguru","m"),("koala","animais","Coala","m"),("panda","animais","Panda","m"),("bear","animais","Urso","m"),("teddy","brinquedos","Ursinho de pelúcia","m"),
  ("fox","animais","Raposa","f"),("wolf","animais","Lobo","m"),("deer","animais","Cervo","m"),("reindeer","natal","Rena","f"),("moose","animais","Alce","m"),
  ("squirrel","animais","Esquilo","m"),("hedgehog","animais","Ouriço","m"),("raccoon","animais","Guaxinim","m"),("skunk","animais","Gambá","m"),("beaver","animais","Castor","m"),
  ("rabbit","animais","Coelho","m"),("bunny","animais","Coelho","m"),("hare","animais","Lebre","f"),("mouse","animais","Ratinho","m"),("rat","animais","Rato","m"),("hamster","animais","Hamster","m"),("gerbil","animais","Gerbil","m"),
  ("guinea pig","animais","Porquinho-da-índia","m"),("bat","halloween","Morcego","m"),("frog","animais","Sapo","m"),("toad","animais","Sapo","m"),("turtle","fundo-do-mar","Tartaruga","f"),("tortoise","animais","Jabuti","m"),
  ("lizard","animais","Lagarto","m"),("gecko","animais","Lagartixa","f"),("iguana","animais","Iguana","f"),("chameleon","animais","Camaleão","m"),("snake","animais","Cobra","f"),
  ("dinosaur","dinossauros","Dinossauro","m"),("t-rex","dinossauros","Tiranossauro","m"),("trex","dinossauros","Tiranossauro","m"),("stegosaurus","dinossauros","Estegossauro","m"),("triceratops","dinossauros","Triceratops","m"),("brontosaurus","dinossauros","Brontossauro","m"),("pterodactyl","dinossauros","Pterodáctilo","m"),
  ("unicorn","unicornios","Unicórnio","m"),("pegasus","unicornios","Pégaso","m"),("dragon","dragoes-e-fantasia","Dragão","m"),("fairy","dragoes-e-fantasia","Fada","f"),("mermaid","sereias","Sereia","f"),("gnome","dragoes-e-fantasia","Gnomo","m"),("elf","natal","Duende","m"),
  # pets / farm
  ("kitten","gatos","Gatinho","m"),("cat","gatos","Gato","m"),("puppy","cachorros","Filhote de cachorro","m"),("dog","cachorros","Cachorro","m"),
  ("horse","cavalos","Cavalo","m"),("pony","cavalos","Pônei","m"),("donkey","fazenda","Burro","m"),("cow","fazenda","Vaca","f"),("bull","fazenda","Touro","m"),("ox","fazenda","Boi","m"),
  ("pig","fazenda","Porco","m"),("sheep","fazenda","Ovelha","f"),("lamb","fazenda","Cordeiro","m"),("goat","fazenda","Cabra","f"),("chick","fazenda","Pintinho","m"),("chicken","fazenda","Galinha","f"),("hen","fazenda","Galinha","f"),("rooster","fazenda","Galo","m"),
  ("duck","passaros","Pato","m"),("goose","passaros","Ganso","m"),("swan","passaros","Cisne","m"),("tractor","veiculos","Trator","m"),("barn","fazenda","Celeiro","m"),("farm","fazenda","Fazenda","f"),
  # birds
  ("owl","passaros","Coruja","f"),("eagle","passaros","Águia","f"),("hawk","passaros","Gavião","m"),("falcon","passaros","Falcão","m"),("penguin","animais","Pinguim","m"),("flamingo","passaros","Flamingo","m"),
  ("peacock","passaros","Pavão","m"),("pelican","passaros","Pelicano","m"),("heron","passaros","Garça","f"),("stork","passaros","Cegonha","f"),("crane","passaros","Grou","m"),("woodpecker","passaros","Pica-pau","m"),
  ("robin","passaros","Pintarroxo","m"),("sparrow","passaros","Pardal","m"),("swallow","passaros","Andorinha","f"),("dove","passaros","Pomba","f"),("pigeon","passaros","Pombo","m"),("crow","passaros","Corvo","m"),("raven","passaros","Corvo","m"),
  ("turkey","passaros","Peru","m"),("seagull","passaros","Gaivota","f"),("bird","passaros","Pássaro","m"),
  # sea
  ("whale","fundo-do-mar","Baleia","f"),("dolphin","fundo-do-mar","Golfinho","m"),("shark","fundo-do-mar","Tubarão","m"),("octopus","fundo-do-mar","Polvo","m"),("squid","fundo-do-mar","Lula","f"),
  ("jellyfish","fundo-do-mar","Água-viva","f"),("starfish","fundo-do-mar","Estrela-do-mar","f"),("seahorse","fundo-do-mar","Cavalo-marinho","m"),("crab","fundo-do-mar","Caranguejo","m"),("lobster","fundo-do-mar","Lagosta","f"),
  ("shrimp","fundo-do-mar","Camarão","m"),("seal","fundo-do-mar","Foca","f"),("walrus","fundo-do-mar","Morsa","f"),("shell","fundo-do-mar","Concha","f"),("coral","fundo-do-mar","Coral","m"),("clownfish","fundo-do-mar","Peixe-palhaço","m"),("fish","fundo-do-mar","Peixe","m"),
  # insects
  ("butterfly","borboletas","Borboleta","f"),("moth","insetos","Mariposa","f"),("ladybug","insetos","Joaninha","f"),("ladybird","insetos","Joaninha","f"),("bee","insetos","Abelha","f"),("ant","insetos","Formiga","f"),
  ("dragonfly","insetos","Libélula","f"),("grasshopper","insetos","Gafanhoto","m"),("caterpillar","insetos","Lagarta","f"),("snail","insetos","Caracol","m"),("spider","halloween","Aranha","f"),("beetle","insetos","Besouro","m"),("worm","insetos","Minhoca","f"),
  # plants / nature
  ("sunflower","flores","Girassol","m"),("rose","flores","Rosa","f"),("tulip","flores","Tulipa","f"),("daisy","flores","Margarida","f"),("lily","flores","Lírio","m"),("lilly","flores","Lírio","m"),("orchid","flores","Orquídea","f"),
  ("lotus","flores","Flor de lótus","f"),("hibiscus","flores","Hibisco","m"),("poppy","flores","Papoula","f"),("bouquet","flores","Buquê de flores","m"),("flower","flores","Flor","f"),("blossom","flores","Flor","f"),
  ("phlox","flores","Flor","f"),("bluebell","flores","Flor","f"),("violet","flores","Violeta","f"),("cactus","natureza","Cacto","m"),("mushroom","natureza","Cogumelo","m"),("leaf","natureza","Folha","f"),("leaves","natureza","Folhas","f"),
  ("palm","natureza","Coqueiro","m"),("tree","natureza","Árvore","f"),("forest","natureza","Floresta","f"),("landscape","paisagens","Paisagem","f"),("mountain","paisagens","Montanha","f"),("beach","paisagens","Praia","f"),("island","paisagens","Ilha","f"),
  ("waterfall","paisagens","Cachoeira","f"),("lighthouse","paisagens","Farol","m"),("garden","natureza","Jardim","m"),("rainbow","natureza","Arco-íris","m"),("cloud","natureza","Nuvem","f"),("sun","natureza","Sol","m"),("moon","espaco","Lua","f"),
  ("star","natureza","Estrela","f"),("snowflake","natureza","Floco de neve","m"),("autumn","natureza","Outono","m"),("fall","natureza","Outono","m"),("spring","natureza","Primavera","f"),("summer","natureza","Verão","m"),("winter","natureza","Inverno","m"),
  # space
  ("rocket","espaco","Foguete","m"),("astronaut","espaco","Astronauta","m"),("planet","espaco","Planeta","m"),("earth","espaco","Planeta Terra","m"),("saturn","espaco","Saturno","m"),("ufo","espaco","Disco voador","m"),("alien","espaco","Alienígena","m"),("telescope","espaco","Telescópio","m"),
  # vehicles
  ("helicopter","veiculos","Helicóptero","m"),("airplane","veiculos","Avião","m"),("aeroplane","veiculos","Avião","m"),("plane","veiculos","Avião","m"),("jet","veiculos","Avião a jato","m"),("balloon","veiculos","Balão","m"),
  ("firetruck","veiculos","Caminhão de bombeiros","m"),("fire truck","veiculos","Caminhão de bombeiros","m"),("truck","veiculos","Caminhão","m"),("bus","veiculos","Ônibus","m"),("ambulance","veiculos","Ambulância","f"),
  ("police car","veiculos","Carro de polícia","m"),("race car","veiculos","Carro de corrida","m"),("car","veiculos","Carro","m"),("jeep","veiculos","Jipe","m"),("van","veiculos","Van","f"),("taxi","veiculos","Táxi","m"),
  ("motorcycle","veiculos","Moto","f"),("motorbike","veiculos","Moto","f"),("scooter","veiculos","Patinete","m"),("bicycle","veiculos","Bicicleta","f"),("bike","veiculos","Bicicleta","f"),("train","veiculos","Trem","m"),("locomotive","veiculos","Locomotiva","f"),
  ("excavator","veiculos","Escavadeira","f"),("digger","veiculos","Escavadeira","f"),("bulldozer","veiculos","Trator de esteira","m"),("submarine","veiculos","Submarino","m"),("sailboat","veiculos","Veleiro","m"),("ship","veiculos","Navio","m"),("boat","veiculos","Barco","m"),("yacht","veiculos","Iate","m"),
  # food
  ("easter egg","pascoa","Ovo de Páscoa","m"),("easter bunny","pascoa","Coelho da Páscoa","m"),
  ("watermelon","frutas","Melancia","f"),("strawberry","frutas","Morango","m"),("pineapple","frutas","Abacaxi","m"),("banana","frutas","Banana","f"),("apple","frutas","Maçã","f"),("pear","frutas","Pera","f"),("cherry","frutas","Cereja","f"),
  ("grape","frutas","Uva","f"),("orange","frutas","Laranja","f"),("lemon","frutas","Limão","m"),("mango","frutas","Manga","f"),("coconut","frutas","Coco","m"),("avocado","frutas","Abacate","m"),("fruit","frutas","Frutas","f"),
  ("carrot","legumes-e-verduras","Cenoura","f"),("tomato","legumes-e-verduras","Tomate","m"),("corn","legumes-e-verduras","Milho","m"),("pumpkin","halloween","Abóbora","f"),("potato","legumes-e-verduras","Batata","f"),("broccoli","legumes-e-verduras","Brócolis","m"),("vegetable","legumes-e-verduras","Legumes","m"),("pepper","legumes-e-verduras","Pimentão","m"),("onion","legumes-e-verduras","Cebola","f"),
  ("ice cream","comidas-e-doces","Sorvete","m"),("icecream","comidas-e-doces","Sorvete","m"),("cupcake","comidas-e-doces","Cupcake","m"),("birthday cake","aniversario","Bolo de aniversário","m"),("cake","comidas-e-doces","Bolo","m"),("cookie","comidas-e-doces","Biscoito","m"),
  ("candy","comidas-e-doces","Doce","m"),("lollipop","comidas-e-doces","Pirulito","m"),("donut","comidas-e-doces","Rosquinha","f"),("doughnut","comidas-e-doces","Rosquinha","f"),("pizza","comidas-e-doces","Pizza","f"),("burger","comidas-e-doces","Hambúrguer","m"),("hamburger","comidas-e-doces","Hambúrguer","m"),
  ("sandwich","comidas-e-doces","Sanduíche","m"),("bread","comidas-e-doces","Pão","m"),("cheese","comidas-e-doces","Queijo","m"),("egg","comidas-e-doces","Ovo","m"),("coffee","objetos","Xícara de café","f"),("teapot","objetos","Bule","m"),("cup","objetos","Xícara","f"),
  # objects / home / school
  ("castle","casas-e-castelos","Castelo","m"),("church","religiosos","Igreja","f"),("chapel","religiosos","Capela","f"),("cathedral","religiosos","Catedral","f"),("mosque","casas-e-castelos","Mesquita","f"),("temple","casas-e-castelos","Templo","m"),
  ("house","casas-e-castelos","Casa","f"),("home","casas-e-castelos","Casa","f"),("cottage","casas-e-castelos","Casinha","f"),("igloo","casas-e-castelos","Iglu","m"),("windmill","casas-e-castelos","Moinho","m"),("tent","casas-e-castelos","Barraca","f"),
  ("crown","princesas-e-coroas","Coroa","f"),("princess","princesas-e-coroas","Princesa","f"),("prince","princesas-e-coroas","Príncipe","m"),("queen","princesas-e-coroas","Rainha","f"),("king","princesas-e-coroas","Rei","m"),("knight","dragoes-e-fantasia","Cavaleiro","m"),
  ("angel","religiosos","Anjo","m"),("nativity","natal","Presépio","m"),("jesus","religiosos","Jesus","m"),("noah","religiosos","Arca de Noé","f"),("bible","religiosos","Bíblia","f"),("cross","religiosos","Cruz","f"),
  ("santa","natal","Papai Noel","m"),("christmas tree","natal","Árvore de Natal","f"),("christmas","natal","Natal","m"),("snowman","natal","Boneco de neve","m"),("christmas ornament","natal","Enfeite de Natal","m"),("ornament","padroes-e-arte-relaxante","Ornamento","m"),("bell","natal","Sino","m"),("stocking","natal","Meia de Natal","f"),("gingerbread","natal","Biscoito de gengibre","m"),("wreath","natal","Guirlanda","f"),
  ("easter","pascoa","Páscoa","f"),("halloween","halloween","Halloween","m"),("witch","halloween","Bruxa","f"),("ghost","halloween","Fantasma","m"),("jack-o","halloween","Abóbora de Halloween","f"),("haunted","halloween","Casa assombrada","f"),
  ("valentine","coracoes","Coração","m"),("heart","coracoes","Coração","m"),("gift","aniversario","Presente","m"),("present","aniversario","Presente","m"),("party","aniversario","Festa","f"),("birthday","aniversario","Aniversário","m"),
  ("soccer","futebol","Futebol","m"),("football","futebol","Futebol","m"),("ball","brinquedos","Bola","f"),("kite","brinquedos","Pipa","f"),("toy","brinquedos","Brinquedo","m"),("doll","brinquedos","Boneca","f"),("robot","brinquedos","Robô","m"),("chess","brinquedos","Xadrez","m"),
  ("drum","musica","Tambor","m"),("guitar","musica","Violão","m"),("violin","musica","Violino","m"),("piano","musica","Piano","m"),("trumpet","musica","Trompete","m"),("music","musica","Música","f"),("saxophone","musica","Saxofone","m"),
  ("clown","circo","Palhaço","m"),("circus","circo","Circo","m"),("pirate","dragoes-e-fantasia","Pirata","m"),("treasure","dragoes-e-fantasia","Tesouro","m"),("wizard","dragoes-e-fantasia","Mago","m"),
  ("umbrella","objetos","Guarda-chuva","m"),("clock","objetos","Relógio","m"),("lamp","objetos","Abajur","m"),("vase","objetos","Vaso","m"),("pot","objetos","Vaso","m"),("basket","objetos","Cesta","f"),("shoe","objetos","Sapato","m"),("dress","objetos","Vestido","m"),("hat","objetos","Chapéu","m"),
  ("pencil","escola","Lápis","m"),("book","escola","Livro","m"),("backpack","escola","Mochila","f"),("globe","escola","Globo terrestre","m"),
  ("doctor","profissoes","Médico","m"),("nurse","profissoes","Enfermeira","f"),("firefighter","profissoes","Bombeiro","m"),("fireman","profissoes","Bombeiro","m"),("police","profissoes","Policial","m"),("chef","profissoes","Cozinheiro","m"),("farmer","profissoes","Fazendeiro","m"),
  ("mandala","mandalas","Mandala","f"),("rosette","mandalas","Mandala","f"),("zentangle","padroes-e-arte-relaxante","Zentangle","m"),("doodle","padroes-e-arte-relaxante","Rabisco decorativo","m"),("celtic","padroes-e-arte-relaxante","Nó celta","m"),("arabesque","padroes-e-arte-relaxante","Arabesco","m"),
  ("flag","bandeiras","Bandeira","f"),("map","escola","Mapa","m"),
]

ADJ = [("cute","fofo"),("baby","filhote"),("happy","feliz"),("smiling","sorrindo"),("flying","voando"),("sleeping","dormindo"),("running","correndo"),("sitting","sentado"),("jumping","pulando"),
       ("cartoon","de desenho animado"),("vintage","antigo"),("old","antigo"),("little","pequeno"),("small","pequeno"),("big","grande"),("funny","engraçado"),("simple","simples"),("easy","fácil"),("christmas","de Natal"),("easter","de Páscoa")]

BLOCK = ["malfibel","super-jesus","ai-","-ai","ai-generated","report-card","get-well","braces","1bit","template","griswold","man-with-hat","vintage-lady","crossword","chess-coloring-book-dibujo-ajedrez-para-colorear-15","ekg","anatom","skelet","nude","naked","body","male","female","woman","women","sexy","bikini","lingerie","vitruv","muscle","torso","breast","kiss","tattoo","devil","demon","zombie","skull","gun","rifle","weapon","war","blood","grave","coffin","dead","death","bomb","knife","sword","axe","beer","wine","cocktail","cigar","smok","drug","anxiety","depress","suicide","trump","obama","politic","religion-","swastika","isis","terror","prison","jail","hell","satan","horror","scary","creepy","monster","sushi-girl","pin-up","pinup","fashion"]

PLANT_WORDS = ["cabbage","currant","sorrel","grass","parsnip","bush","weed","root","clover","fern","moss","sedge","wort","berry","thistle","lupine","blazing","bluebell","phlox","huckleberry","fennel","mallow","yarrow","sage","mint","plant"]
EXCLUDE = {"263488","268436","291619","336169","181234","20300","22087","245257","270697","352783","352784","352785","352787","314889","571","572","203486","313287","299783","316824","324880","309126","190512","250392","276815","276816","318271","319340","336762","337030","345968","313002","1513","234557","274078","337716","337717","16131","62563","307615","344012"}
