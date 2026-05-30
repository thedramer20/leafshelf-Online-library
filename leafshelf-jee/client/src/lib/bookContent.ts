export interface Chapter {
  number: number;
  title: string;
  paragraphs: string[];
}

export interface BookContent {
  totalPages: number;
  chapters: Chapter[];
}

function ch(number: number, title: string, paragraphs: string[]): Chapter {
  return { number, title, paragraphs };
}

const FALLBACK_OPEN = [
  'The morning light fell soft across the page, and for a moment the world felt held in suspension — as though the story itself were holding its breath. Pages turned slowly here. Lives unfolded slower still.',
  'There is, in every book worth opening, a quiet promise: that the words ahead will matter. That a stranger\'s thoughts will somehow become your own. That you will not be the same reader on the last page as you were on the first.',
  'And so, with a small steady breath, the journey begins. The world outside grows quieter. The clock on the wall keeps time only for the room. Whatever waits within these pages waits patiently — for you.',
];

export const BOOK_CONTENTS: Record<number, BookContent> = {
  // 1 — To Kill a Mockingbird
  1: {
    totalPages: 281,
    chapters: [
      ch(1, 'Maycomb in Summer', [
        'When summer came to Maycomb, the days stretched long and slow, thick with the smell of honeysuckle and the dust that lifted from the unpaved streets. The town moved at its own quiet pace, indifferent to the rest of the world.',
        'Scout knew every porch, every crooked fence post, every cracked windowpane along her street. She knew which neighbors offered lemonade and which ones offered nothing but a stern look from behind a curtain.',
        'Atticus said the heat would pass, the way all things did. But Scout watched the men gathered outside the courthouse and wondered whether some things passed at all — or whether they simply settled into the bones of a place and stayed.',
      ]),
      ch(2, 'The Radley House', [
        'The Radley house sat at the end of the street like a held breath. Children crossed the road to avoid it. Adults pretended it was not there. And yet everyone, every single one of them, knew exactly where it was.',
        'Jem said Boo Radley had not stepped outside in nineteen years. Dill, newly arrived from Meridian, declared this impossible. Scout said nothing, because she suspected that some people choose silence the way others choose words — carefully, and for reasons they do not owe anyone.',
      ]),
      ch(3, 'A Lesson at the Table', [
        'Calpurnia ran the kitchen like she ran the family — with quiet authority and a wooden spoon never far from her hand. There were rules at her table, and breaking them was not an option for anyone, regardless of who their father was.',
        'When Walter Cunningham came to lunch, Scout learned a small but lasting truth: company is company, and company is treated with respect. It would not be the last lesson Calpurnia taught her, but it was one of the ones she remembered longest.',
      ]),
      ch(4, 'Knothole', [
        'Some mornings, the knothole in the oak tree held small offerings: chewing gum, two pennies polished bright, a tiny carved figure no bigger than a thumb. No one ever saw who left them. That, perhaps, was the gift.',
        'Jem turned the figures over in his hands as if they might whisper their origins. Scout watched her brother\'s face — the curiosity, the wariness, the slow understanding that someone, somewhere, was paying attention.',
      ]),
      ch(5, 'Atticus', [
        'Atticus was older than most fathers, gentler than most men, and stricter than either of his children sometimes wished. He wore the same suits, read the same papers, and answered the same questions with the same patient honesty he had always shown.',
        '"You never really understand a person," he said one evening, "until you consider things from his point of view — until you climb into his skin and walk around in it." Scout did not yet know how often, and how hard, she would try.',
      ]),
    ],
  },

  // 2 — 1984
  2: {
    totalPages: 328,
    chapters: [
      ch(1, 'The Hour of the Telescreen', [
        'The clocks struck thirteen, the way they always did now, and Winston pulled his coat tighter against a wind that never quite seemed to come from outside. The hallway smelled of boiled cabbage and old rugs — a smell so consistent it had become a kind of weather.',
        'On every wall the posters watched. On every screen the voice spoke. There was no hour of the day in which a person could be alone with himself, and Winston had nearly forgotten what that aloneness had ever felt like.',
        'He thought, sometimes, about the diary hidden in the small alcove beside his window. He thought about it the way a man thinks about a candle in a room full of darkness — quietly, carefully, and only when he is sure no one is watching.',
      ]),
      ch(2, 'A Forbidden Page', [
        'The pen was old. The ink was older. The paper, smuggled from a forgotten shop in a forgotten part of the city, smelled faintly of something Winston could not name. Memory, perhaps. Or the absence of it.',
        'He wrote a single sentence and then another. The act felt enormous and ridiculous all at once — as though he were a child setting fire to a field he could never put out. And yet his hand kept moving, because once a thought becomes a sentence, it belongs to the world.',
      ]),
      ch(3, 'The Two Minutes', [
        'The screens flickered to life, and the faces around him twisted into the familiar choreography of rage. Winston joined, because not joining was a thing one did not do. But somewhere behind his shouting, a small quiet voice asked him whether he believed any of it at all.',
      ]),
      ch(4, 'Julia', [
        'She passed him in the corridor and slipped a piece of paper into his hand the way a magician slips a coin. Three words. Three impossible, dangerous, beautiful words. He read them four times before he was certain he had read them at all.',
      ]),
      ch(5, 'The Room Above the Shop', [
        'There was no telescreen in the room. That was the first thing Winston noticed. The second was that the world outside the small window still existed — still had pigeons, still had washing strung between buildings, still had sound that was not the State\'s.',
        'For a few stolen hours, he allowed himself to believe in the possibility of an ordinary life. The belief did not last. It never did. But while it lasted, it was the truest thing he had felt in years.',
      ]),
    ],
  },

  // 3 — The Great Gatsby
  3: {
    totalPages: 180,
    chapters: [
      ch(1, 'East Egg, West Egg', [
        'Across the bay, the lights of East Egg burned cool and certain — old money, old families, old certainties. On our side, the lights burned brighter and a little more desperately, as though they were trying to convince someone, anyone, that they belonged.',
        'Gatsby stood on his lawn most evenings, looking out across the water. He never said what he was looking at. He didn\'t have to. There are some men whose silences tell you everything you need to know, if you are patient enough to listen.',
      ]),
      ch(2, 'A Dinner at the Buchanans\'', [
        'Daisy laughed the way some women sing — softly, distractedly, as if she were not entirely sure anyone was listening. Tom laughed differently. Tom laughed like a man who had never doubted, for a single moment, that the room was his.',
        'I sat between them and watched the candles flicker, and I thought: there is something in this house that will not end well. I could not have told you what. Only that the air had the weight of something already decided.',
      ]),
      ch(3, 'The Parties', [
        'They came in cars the color of butter, in dresses the color of champagne, in moods the color of nothing at all. They drank, they danced, they spilled secrets that would not be remembered in the morning. And through all of it, Gatsby moved like a host in his own dream.',
      ]),
      ch(4, 'The Green Light', [
        'He had been watching that light for five years. Five years of waiting. Five years of believing that a thing wanted hard enough must, eventually, come true. I did not have the heart to tell him what I suspected — that the light had been only a light all along.',
      ]),
      ch(5, 'The Last Summer', [
        'The heat that summer was something living. It pressed against the windows. It curled into the bedsheets. It made men say things they could not unsay and women remember things they had spent years forgetting. And by the end of it, nothing was the same.',
      ]),
    ],
  },

  // 4 — Pride and Prejudice
  4: {
    totalPages: 432,
    chapters: [
      ch(1, 'A Truth Universally Acknowledged', [
        'It is, of course, a thing widely agreed upon — that a gentleman of comfortable fortune must be in want of a wife. Whether the gentleman himself agrees is a question rarely asked, and never answered to anyone\'s satisfaction.',
        'Mrs. Bennet had five daughters and a single, all-consuming ambition. Mr. Bennet had a library and a habit of irony. The household, balanced upon these two foundations, had survived rather better than anyone had a right to expect.',
        '"My dear Mr. Bennet," she announced one morning, "have you heard that Netherfield Park is let at last?" He had not. He did not particularly want to. He suspected, however, that he was about to.',
      ]),
      ch(2, 'The Ball at Meryton', [
        'There is no occasion, in the country, more dangerous than a ball. Dresses are studied, partners are counted, glances are weighed against rumors, and reputations are made or unmade between the punch bowl and the door.',
        'Elizabeth danced little, observed much, and overheard a single remark from a Mr. Darcy — uttered with the carelessness of a man who has never had to consider whether anyone might be listening. She decided then and there that she did not like him. It was a decision she would, in time, have leisure to reconsider.',
      ]),
      ch(3, 'Mr. Bingley\'s Manners', [
        'Mr. Bingley was everything a man ought to be: cheerful, attentive, agreeable to everyone he met. His friend, Mr. Darcy, was — by every visible measure — none of these things. And yet, somehow, the two of them remained the closest of companions. The world is full of such small bewilderments.',
      ]),
      ch(4, 'Letters from Hertfordshire', [
        'Jane wrote in the way Jane spoke — gently, and with a forgiving emphasis on every kindness, however small. Elizabeth read her sister\'s letters and smiled, and worried, and read them again. There are some hopes one cannot help carrying, even when one knows better.',
      ]),
      ch(5, 'A Reluctant Reconsideration', [
        'It is one of the more humbling experiences of a thinking woman\'s life to discover that her first impression was, in some essential respect, wrong. Elizabeth allowed herself this discovery quietly, in private, and resolved — for the moment, at least — to tell no one. Not even Jane.',
      ]),
    ],
  },

  // 5 — The Hobbit
  5: {
    totalPages: 310,
    chapters: [
      ch(1, 'An Unexpected Visitor', [
        'In a hill, in a hole that was neither damp nor dirty nor bare, there lived a hobbit. The hole had a round green door, polished brass fittings, and a small brass knocker that was very seldom used, because hobbits — as a rule — preferred their afternoons quiet and their visitors expected.',
        'On this particular morning, however, the knocker was used. Several times. Loudly. And the visitor on the other side of the door was not, in any sense Bilbo could identify, expected.',
        '"Good morning," said Bilbo, because he had not yet decided what else to say. The wizard on his doorstep regarded him for a long moment, then smiled the way a person smiles when he knows a great deal more about the day than you do.',
      ]),
      ch(2, 'The Company Arrives', [
        'They arrived in twos and threes and sometimes fours, and by the time the sun set Bilbo had thirteen dwarves in his sitting room, a kettle on every burner, and the unsettling conviction that his pantry would not, after this evening, ever be quite the same again.',
        'They sang as they ate. They ate as they sang. And then, when the dishes were stacked impossibly high and the fire had burned down to coals, Thorin Oakenshield spoke. And whatever Bilbo had been planning to do with the rest of his year, he found he was no longer planning to do it.',
      ]),
      ch(3, 'On the Road', [
        'The road ran on, the way roads do, indifferent to whether you wished it ended sooner. Bilbo missed his armchair. He missed his second breakfast. He missed, most of all, the comfortable conviction that the world was a small and well-ordered place. None of those convictions, he was beginning to suspect, would survive the journey ahead.',
      ]),
      ch(4, 'A Riddle in the Dark', [
        'Down in the deep places of the world, where no daylight had ever reached, Bilbo found himself alone with a creature that spoke in soft, slippery whispers — and with a small gold ring that fit far too neatly in his pocket.',
        'They played at riddles, because that was the rule of the place. And when the game ended, Bilbo discovered something rather important about himself: that even a quiet hobbit, given the right corner and the right reason, can be very brave indeed.',
      ]),
      ch(5, 'The Lonely Mountain', [
        'It rose against the horizon like a thought no one had quite finished — vast, dark, and very, very old. Somewhere beneath it, a dragon slept on a hoard of gold and ruin. Somewhere beneath it, a door waited that no map had ever quite drawn. The company stood in silence for a long time before anyone said a word.',
      ]),
    ],
  },

  // 6 — Harry Potter and the Philosopher's Stone
  6: {
    totalPages: 223,
    chapters: [
      ch(1, 'The Boy in the Cupboard', [
        'Number four, Privet Drive, was a perfectly ordinary house, with a perfectly ordinary garden, and perfectly ordinary curtains in every window. The Dursleys were proud of being perfectly ordinary. It was, they often said, the only proper thing for people to be.',
        'Under the stairs of this perfectly ordinary house was a small dark cupboard. And in the cupboard lived a boy who, despite the Dursleys\' best efforts, was not — and never would be — ordinary at all.',
      ]),
      ch(2, 'Letters from No One', [
        'The first letter arrived on a Tuesday. The second arrived on a Wednesday. By Saturday they were coming down the chimney, sliding under the door, fluttering through the kitchen window in such numbers that even Uncle Vernon could not, in any reasonable sense, ignore them.',
        'Harry had never received a letter before. Now he was receiving hundreds. And every single one of them was addressed, in green ink, to him.',
      ]),
      ch(3, 'Diagon Alley', [
        'Behind a small brick wall, three taps in the right order, and suddenly the world was not what it had been. Cauldrons in the windows. Owls in the cages. A bank run by goblins, a wandmaker who could remember every wand he had ever sold, and a feeling in Harry\'s chest like coming home to a place he had never known existed.',
      ]),
      ch(4, 'The Sorting Hat', [
        'It was an ancient hat. Patched and dusty and singed at the brim. And it sang. And it whispered, when set upon a small first-year\'s head, things that no one else could hear.',
        'When it whispered to Harry, it considered him for a long, careful moment. Then, in a voice meant only for him, it asked a question he would remember for the rest of his life.',
      ]),
      ch(5, 'A Mirror in an Empty Room', [
        'The mirror stood alone in the disused classroom, taller than a man, framed in gold, with strange writing carved across its top. Harry stepped before it slowly. And what he saw in the glass was not himself — not exactly. It was himself, and more than himself, and everything he had never dared to want.',
      ]),
    ],
  },

  // 7 — The Lord of the Rings
  7: {
    totalPages: 1178,
    chapters: [
      ch(1, 'A Long-Expected Party', [
        'The Shire prepared for the party the way the Shire prepared for everything — with thoroughness, and gossip, and a quiet pride in doing things the proper way. Bilbo Baggins was turning eleventy-one. The whole of Hobbiton, and a fair portion of Bywater besides, intended to be present for the occasion.',
        'Frodo, his nephew and heir, watched the preparations with a vague unease he could not quite name. There was something in Bilbo\'s look these days — a faraway quality, as if part of him were already somewhere else, listening for a sound only he could hear.',
      ]),
      ch(2, 'The Shadow Returns', [
        'Gandalf came late one night, his cloak still damp with travel, his face graver than Frodo had ever seen it. He sat by the fire for a long time before he spoke. And when he did speak, the room seemed to grow smaller, and the night outside the window grew very large indeed.',
      ]),
      ch(3, 'The Road Goes Ever On', [
        'They left the Shire in the half-light of a morning that did not yet know it was a morning. Behind them, hobbits slept in their warm round houses, ignorant of the world that was about to ask something of them all. Ahead, a road wound east — endless, ordinary, and full of every danger the maps had never bothered to mark.',
      ]),
      ch(4, 'Rivendell', [
        'The Last Homely House sat where the river bent, half-hidden in trees that seemed older than the stones beneath them. Here the air was kinder, the lamps warmer, and the songs — when they came — drifted up from the long halls as if the walls themselves remembered the words.',
      ]),
      ch(5, 'The Council', [
        'Around the carved table sat elves, dwarves, men, and a hobbit who felt very small indeed. The ring lay upon the stone before them, no larger than a coin, and yet it had drawn each of them, by different roads, to this single hour.',
        '"I will take it," said Frodo, before he had quite decided to say anything at all. The words were small. The silence that followed them was very large.',
      ]),
    ],
  },

  // 8 — Brave New World
  8: {
    totalPages: 311,
    chapters: [
      ch(1, 'The Hatchery', [
        'The building rose pale and clean against a pale and clean sky. Inside, beneath cool light, the future of an entire species was arranged in neat racks, labeled, monitored, and corrected for any deviation from the agreed-upon design.',
        'Visitors were given tours. The tours were carefully written. Every question that might be asked had, long ago, been answered in a way that made further questions unnecessary.',
      ]),
      ch(2, 'A World That Works', [
        'No one was unhappy. That had been arranged. No one was lonely. That had also been arranged. And if, very occasionally, someone felt something the language had no word for, there was a small white pill that took the feeling neatly away, the way a damp cloth takes a smudge from a window.',
      ]),
      ch(3, 'The Reservation', [
        'Beyond the borders of the comfortable world, in the dry country no one bothered to manage, life had been left to take its own shape. The shape was strange. The shape involved age, and pain, and a kind of stubborn, untidy joy that the comfortable world had spent generations trying to forget.',
      ]),
      ch(4, 'A Stranger Among Us', [
        'They brought him in like a curiosity from a museum. He read. He wept. He spoke of things no one else had any vocabulary for. Some pitied him. Some laughed. A very small number of people — quieter than the others — listened.',
      ]),
      ch(5, 'The Cost of Comfort', [
        'It was not that the world was cruel. It was, in fact, exquisitely kind. The trouble was that its kindness had a price, and the price was a word for which the language no longer had any use: choice.',
      ]),
    ],
  },

  // 9 — The Alchemist
  9: {
    totalPages: 197,
    chapters: [
      ch(1, 'A Shepherd\'s Dream', [
        'The boy slept beneath a fig tree in the corner of an abandoned church, his sheep gathered around him like a quiet, breathing wall. He dreamed the same dream he had dreamed a week before — a child taking his hand, leading him across the desert, pointing toward the great triangular shapes that rose against the sky.',
        'In the morning he opened his eyes to the gray light before dawn. The sheep stirred. The dream lingered, the way some dreams do — not as a memory, but as a small persistent ache, as if the day itself were asking him a question he had not yet learned how to answer.',
      ]),
      ch(2, 'The Old King', [
        'In the square of a small town, an old man sat beside the boy and spoke of personal legends — of the one true thing a person is meant to do with the brief, brilliant gift of their life. The boy listened. The old man left. And the world afterwards was very nearly the same world it had been before. Nearly. But not entirely.',
      ]),
      ch(3, 'Tangier', [
        'The city was loud and bright and absolutely indifferent to him. He lost his money on the first day and his certainty on the second. By the third, he had begun to suspect that the journey he had set out on was not the journey he was actually on. He was learning, as travelers learn, that the road has its own intentions.',
      ]),
      ch(4, 'The Desert', [
        'The desert taught him patience first. Then it taught him silence. Then, very slowly, it taught him to listen — not to the wind exactly, and not to the sand, but to whatever soft, watchful thing lay underneath them both.',
      ]),
      ch(5, 'The Alchemist', [
        '"When you want something," the old alchemist said, looking up from his small fire, "all the universe conspires in helping you to achieve it." The boy did not entirely believe him. He suspected, however, that he was beginning to.',
      ]),
    ],
  },

  // 10 — Crime and Punishment
  10: {
    totalPages: 671,
    chapters: [
      ch(1, 'A Hot July Evening', [
        'The young man left his small attic room and stepped into the heavy heat of the street. He had not eaten properly in days. His coat was too thin for the season, his shoes too worn for the cobblestones, and his thoughts too loud for the company of any other living person.',
        'He walked because walking was the only way to keep his mind from settling on the single question that had begun, very slowly and very seriously, to settle in his mind regardless.',
      ]),
      ch(2, 'A Plan Half-Made', [
        'The plan was not a plan, not exactly. It was an idea with the shape of a plan — a question wearing the clothes of an answer. He turned it over again and again until he could no longer remember when he had first thought of it. That, he understood, was a warning. He chose, for the moment, not to listen.',
      ]),
      ch(3, 'The Old Woman', [
        'She was small, sharp-eyed, suspicious of every visitor and especially of him. He had pawned with her before. He pawned with her now. And as the small silver watch left his hand and entered hers, he understood, with a clarity that frightened him, that he had already decided. The deciding had happened somewhere behind his thoughts.',
      ]),
      ch(4, 'Conscience', [
        'Conscience is a strange country. It does not appear on any map. It cannot be reached by any road. And yet a man may find himself standing in the middle of it, suddenly, without remembering how he arrived — and without the slightest idea how to leave.',
      ]),
      ch(5, 'Sonya', [
        'She read to him from a small, much-worn book, in a voice barely louder than the candle between them. He listened. He listened in a way he had not listened to anyone in months. And somewhere in the middle of the reading, something in him that had been very tightly shut began, almost against its will, to open.',
      ]),
    ],
  },

  // 11 — Moby Dick
  11: {
    totalPages: 635,
    chapters: [
      ch(1, 'Call Me Ishmael', [
        'Some years ago — never mind how many precisely — having little money and nothing in particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen, of regulating the circulation, of remembering that the land is not, in the end, the whole story.',
      ]),
      ch(2, 'The Spouter-Inn', [
        'The inn sat hunched against the wind, its sign creaking, its lamp guttering, its door warped from too many seasons of damp salt air. Inside, the air was warmer than the night outside but only by a small, hard-earned margin.',
        'They put me up in a room with a stranger. The stranger was, as it turned out, the most extraordinary man I had ever shared a roof with. By morning we were friends. The sea, I would learn, has a way of arranging such things.',
      ]),
      ch(3, 'The Pequod', [
        'She was an old ship, weathered as a piece of driftwood, decorated with the teeth and bones of the creatures she had hunted in waters most men never see. To stand on her deck was to feel small in a way the land had never quite managed.',
      ]),
      ch(4, 'The Captain', [
        'He came up from his cabin only once that first week, and when he did, the deck went quiet without anyone choosing to make it so. He stood at the rail. He stared out at a sea that, as far as the rest of us could tell, held nothing. But he was not looking at what we were looking at. He never had been.',
      ]),
      ch(5, 'The Whiteness of the Whale', [
        'There are colors that comfort. There are colors that warn. And there is a particular color — pale, vast, untouched by any other shade — that, encountered at sea, will make a man stand very still and forget for a moment exactly who he is.',
      ]),
    ],
  },

  // 12 — The Picture of Dorian Gray
  12: {
    totalPages: 254,
    chapters: [
      ch(1, 'The Studio', [
        'The studio was full of the rich odor of roses, and when the light summer wind stirred amid the trees of the garden, there came through the open door the heavy scent of the lilac, or the more delicate perfume of the pink-flowering thorn.',
        'On the easel stood the portrait. Basil set down his brush and looked at it as a man looks at a thing he has, perhaps, been a little too clever in making. Lord Henry, lounging on the sofa, smiled the small, dangerous smile of someone preparing to ruin an afternoon.',
      ]),
      ch(2, 'A Wish', [
        'He stood before the painting for a long time. He thought of every day that would, inevitably, take something from him. He thought of every line the years would draw. And then, half in jest and half in earnest, he made a wish — and the wish, as wishes sometimes do, listened.',
      ]),
      ch(3, 'Lord Henry\'s Theories', [
        '"The aim of life is self-development," said Lord Henry, lighting a cigarette with the unconcerned grace of a man who had never once doubted the value of his own opinions. Dorian listened. Dorian, that afternoon, listened in a way that would change him entirely.',
      ]),
      ch(4, 'Sibyl', [
        'She played Juliet, and the theater hushed. She played her again the next night, and the theater wept. Dorian watched from his small velvet seat and decided, with the certainty of the very young, that he was in love. The certainty did not, as it turned out, last.',
      ]),
      ch(5, 'The Locked Room', [
        'He carried the painting upstairs himself. He locked the door. He put the key in his pocket and felt its small weight against his thigh for the rest of the day. Some things, he had come to understand, were better not looked at — and better, by some distance, not shown.',
      ]),
    ],
  },

  // 13 — Jane Eyre
  13: {
    totalPages: 532,
    chapters: [
      ch(1, 'Gateshead', [
        'There was no possibility of taking a walk that day. The cold winter wind had brought with it clouds so somber, and a rain so penetrating, that further outdoor exercise was out of the question. I was glad of it. I never liked long walks, especially on chilly afternoons.',
        'I retreated to the small breakfast-room and drew the red curtain nearly close, and there, half hidden, with a book on my knees, I happily forgot the world.',
      ]),
      ch(2, 'Lowood', [
        'The school stood gray and damp beside a gray and damp stream, and the cold inside its walls was a different cold than the cold outside. It was a cold that lived in the floorboards, in the porridge, in the way the older girls had learned not to expect very much from any given day.',
      ]),
      ch(3, 'Thornfield', [
        'The house rose from the mist like a thought half-finished. There were too many rooms. There were too many corridors. And somewhere, very faintly, there was a sound that did not quite belong to any of them — a sound the housekeeper, when asked, refused to discuss.',
      ]),
      ch(4, 'Mr. Rochester', [
        'He was not handsome in any conventional sense. He was not charming in any conventional sense. He was, however, a man who looked at her as though she were a person — fully, entirely, without the small condescensions she had grown used to. That alone, she discovered, was a startling thing.',
      ]),
      ch(5, 'A Voice on the Moors', [
        'She heard it across miles of wind and heather — a voice calling her name, distinctly, in a tone she had no reasonable way of hearing. She stood for a long moment in the empty road. Then, without quite deciding to, she turned and began to walk back.',
      ]),
    ],
  },

  // 14 — Wuthering Heights
  14: {
    totalPages: 416,
    chapters: [
      ch(1, 'The Moors', [
        'The wind on the moors did not pass through a place. It lived there. It moved through the heather as if it had business with every blade of it, and it pressed against the windows of the old farmhouse as if it had not yet decided whether to come in.',
        'Heathcliff watched from the doorway, dark against the gray light, and said nothing at all. He often said nothing. The silence in him was not the silence of having little to say. It was the silence of having a great deal more to say than the day had time for.',
      ]),
      ch(2, 'Catherine', [
        'She came running back from the moors with her hair undone and her cheeks bright, and she laughed at her own breathlessness in a way that no one else in the house ever laughed at anything. She and Heathcliff were, by then, already one person in two bodies, though neither of them had yet given the matter a name.',
      ]),
      ch(3, 'A Quarrel', [
        'They quarreled the way they did everything else — fiercely, without reservation, and with a complete inability to leave a single feeling unsaid. The walls of the old house had absorbed a great many such quarrels by then. They would absorb a great many more.',
      ]),
      ch(4, 'Departures', [
        'He left in the night, without telling anyone. He left because she had said something she could not unsay. He left because the room had grown too small for both of their angers, and because some doors, once cracked open, will not stay closed.',
      ]),
      ch(5, 'A Return', [
        'He came back changed. Richer. Quieter. A great deal more dangerous. The wind on the moors had not changed in the years of his absence, but the man who walked into the front hall of the old house was not, in any important sense, the boy who had walked out of it.',
      ]),
    ],
  },

  // 15 — Anna Karenina
  15: {
    totalPages: 864,
    chapters: [
      ch(1, 'Happy and Unhappy Families', [
        'Every happy family is, in its own quiet way, a small and well-arranged piece of luck. Every unhappy family invents its own particular weather — its own storms, its own silences, its own ways of pretending the storms are not there.',
        'In the Oblonsky house, that morning, no one was pretending. The dining room remained empty. The children had been kept to the nursery. And the servants, with the careful politeness of people who have understood the situation entirely, moved through the rooms saying as little as possible.',
      ]),
      ch(2, 'A Train Station', [
        'The snow came in sideways through the lamplight, and the engine breathed white into the cold air, and somewhere among the bundled travelers a woman in a dark coat stepped down from the carriage and glanced — only for a moment — across the platform. The moment was small. The consequences were not.',
      ]),
      ch(3, 'Levin in the Country', [
        'He preferred the fields to the drawing rooms. He preferred the smell of cut hay to the smell of perfumed candles. He preferred the company of the men who worked beside him to the company of the men who watched him work. It was, he understood, a preference that would always make his life slightly more difficult than other people\'s.',
      ]),
      ch(4, 'A Ball', [
        'She wore black, when everyone else wore white, and the room rearranged itself around her without any of the dancers quite realizing it had. Kitty saw. Kitty understood. And from that single understanding, the rest of the winter began to unfold the way winters do — quietly, and without anyone\'s permission.',
      ]),
      ch(5, 'A Letter Unsent', [
        'She wrote it. She read it. She tore it into careful, unhurried pieces and placed the pieces into the small grate. The fire took them gently. The room was, afterwards, very quiet. And the thing the letter had been written about — that, of course, remained.',
      ]),
    ],
  },

  // 16 — Don Quixote
  16: {
    totalPages: 982,
    chapters: [
      ch(1, 'A Gentleman of La Mancha', [
        'In a village of La Mancha, the name of which I have no desire to call to mind, there lived a gentleman who kept a lance, an ancient shield, a thin nag, and a greyhound for coursing. His diet was as modest as his fortune, and his books — his books! — were the only riches he counted worth keeping.',
        'He read until he no longer slept. He read until reading became, very quietly, a kind of believing. And one bright morning, he made a decision so improbable that no neighbor, on hearing of it, would credit it until they had seen the man himself ride past their gate.',
      ]),
      ch(2, 'A Squire', [
        'Sancho Panza was short, round, and possessed of an inexhaustible supply of proverbs for every conceivable occasion. He had no clear reason to follow the gentleman onto the road, except that he had been promised an island to govern, and a man, after all, must have ambitions.',
      ]),
      ch(3, 'The Windmills', [
        'They stood in the distance, vast and slow, their great arms turning against the pale sky. To Sancho they were windmills. To the gentleman of La Mancha they were giants. And he settled his lance, and he set his horse, and he rode at them with a courage that no windmill, in the whole long history of windmills, had ever been asked to bear.',
      ]),
      ch(4, 'Inns and Castles', [
        'Every inn became a castle. Every innkeeper became a lord. Every weary serving-girl became a noble lady awaiting his particular attention. The world conspired with him; or perhaps he conspired with the world. The difference, after a while, ceased to matter.',
      ]),
      ch(5, 'The Long Road Home', [
        'They turned, eventually, back toward La Mancha. The road was longer than it had been on the way out, the way roads always are when one is going home. And the gentleman, riding ahead, was — though Sancho would not have said it aloud — a little quieter than he had been on the journey out.',
      ]),
    ],
  },

  // 17 — Frankenstein
  17: {
    totalPages: 280,
    chapters: [
      ch(1, 'A Letter from the Ice', [
        'You will rejoice to hear that no disaster has accompanied the commencement of an enterprise which you have regarded with such evil forebodings. I arrived here yesterday; and my first task is to assure my dear sister of my welfare, and increasing confidence in the success of my undertaking.',
        'The ice stretched before us, white and unbroken, and the small ship of our expedition felt very small indeed beneath the vast, indifferent sky.',
      ]),
      ch(2, 'A Stranger on the Ice', [
        'We saw the sledge from a great distance — a thin dark line drawing itself across the white. When the man upon it was finally brought aboard, he was nearly frozen, half mad with cold and exhaustion. And when he could speak again, what he had to say altered the course of every quiet evening I had planned for that voyage.',
      ]),
      ch(3, 'The Spark', [
        'I had toiled for two years for the sole purpose of infusing life into an inanimate body. The candles were burned to their sockets. The instruments stood ready. And in the small dark hour before dawn, I saw the eye of the creature open — and I understood, instantly and forever, that I had done a terrible thing.',
      ]),
      ch(4, 'A Voice in the Forest', [
        '"I expected this reception," said the creature, his voice low, weary, and unsettlingly articulate. "All men hate the wretched; how, then, must I be hated, who am miserable beyond all living things!" He sat down on a stone, and the moonlight fell upon a face that I had hoped never to see again.',
      ]),
      ch(5, 'A Promise Half-Kept', [
        'I had given my word. I had taken it back. He had warned me what would follow. He had been, in this — as in so many things — entirely accurate. And the price of my changing mind was a price that, by then, was no longer mine alone to pay.',
      ]),
    ],
  },

  // 18 — Dracula
  18: {
    totalPages: 418,
    chapters: [
      ch(1, 'Jonathan Harker\'s Journal', [
        '3 May, Bistritz. — Left Munich at 8:35 P.M. on 1st May, arriving at Vienna early next morning; should have arrived at 6:46, but train was an hour late. Buda-Pesth seems a wonderful place, from the glimpse which I got of it from the train.',
        'I left as soon as I could in the evening, the carriage bumping over roads no map had ever quite committed itself to drawing. The driver did not speak. The horses, I noticed, were unusually quiet for horses on a mountain road at dusk.',
      ]),
      ch(2, 'The Castle', [
        'The gate opened before I had quite finished knocking, and the corridor beyond it was lit only by a single guttering lamp held in a hand so pale I might, in better light, have thought it carved. "Welcome to my house," said the count, smiling in a way that did not entirely include his eyes.',
      ]),
      ch(3, 'A Letter to Mina', [
        'My dearest — I have been here a week now, and I am beginning to understand that there are matters about this house that are not, in any ordinary sense, ordinary. The doors I am permitted to enter are very few. The doors I am forbidden are very many. I have begun, in the evenings, to make a small inventory of both.',
      ]),
      ch(4, 'Whitby', [
        'The wind that night came in like a thing alive, driving a great black ship straight onto the rocks. When the harbor men arrived in the morning, they found no living crew. They found, instead, a single large dog — or something resembling one — leaping from the wreck and vanishing into the cliffs.',
      ]),
      ch(5, 'Van Helsing', [
        'He was a small man, neat and bright-eyed, with the manner of a country doctor and the library of a far older profession. He listened to my account from beginning to end without once interrupting. Then he closed the book on his lap and said, very quietly, "We have, my friends, a great deal of work to do."',
      ]),
    ],
  },

  // 19 — The Catcher in the Rye
  19: {
    totalPages: 277,
    chapters: [
      ch(1, 'A Lousy Saturday', [
        'If you really want to hear about it, the first thing you\'ll probably want to know is where I was on that lousy Saturday, and what I was doing, and what kind of mood I was in. I\'m not going to tell you the whole thing. Just the part that matters. Or the part that maybe matters. I haven\'t exactly decided.',
        'It was cold, anyway. That much I can tell you. And I was standing on top of a hill watching a football game I didn\'t care about. People kept yelling things. None of the things were interesting.',
      ]),
      ch(2, 'Pencey', [
        'They kicked me out, naturally. Or maybe I left first. Sometimes it\'s hard to tell which one happened. I packed up my stuff, I shook hands with one or two people who probably won\'t remember me by Tuesday, and I walked out the gates without much of a feeling about it.',
      ]),
      ch(3, 'A Night in the City', [
        'The hotel lobby smelled like cigarette smoke and the kind of perfume people wear when they\'re trying not to be themselves. I took the elevator up. I took it back down. I went into the lounge. I came out of the lounge. I think I was looking for something. I just don\'t know what it was.',
      ]),
      ch(4, 'Phoebe', [
        'She was asleep when I got there, with the lamp on, because she always slept with the lamp on. I sat on the edge of her bed and watched her for a while. There are very few people in the world I can stand to be in a room with, and she is, on balance, the only one of them.',
      ]),
      ch(5, 'The Carousel', [
        'It was raining, and she was going around on the carousel, reaching for the gold ring like all the kids do. And I sat on the bench, soaked, and I started to cry. I don\'t know why. I don\'t entirely know why anything that day. But that part, I remember.',
      ]),
    ],
  },

  // 20 — The Brothers Karamazov
  20: {
    totalPages: 796,
    chapters: [
      ch(1, 'A Family Gathering', [
        'Alyosha Karamazov was the third son of Fyodor Pavlovich Karamazov, a landowner of our district, well known in his own day (and even now still remembered among us) owing to his gloomy and tragic death, which happened exactly thirteen years ago, and which I shall describe in its proper place.',
        'For the present, I will only say that this man — who was, I will admit, a man of a strange sort — had a curious way of binding his three sons to him by the very things that ought to have driven them away.',
      ]),
      ch(2, 'The Monastery', [
        'They went to the elder because Alyosha wished it, and because no one in the family knew quite how to refuse him. The elder, Father Zosima, sat on his small worn chair and received each of them in turn with the careful patience of a man who had seen, in his long life, a great many people walk through a great many doors.',
      ]),
      ch(3, 'A Tavern in the Snow', [
        'Ivan ordered tea, then brandy, then more tea, and they talked the way brothers talk when they have not, in any real sense, talked in years. Alyosha listened. Ivan, by the second hour, was telling him a story — a story so strange and so insistent that Alyosha understood, even as he listened, that he would not forget a single word of it.',
      ]),
      ch(4, 'Dmitri', [
        'He arrived in a fury and left in a fury, and the hours in between were filled with declarations he half meant and promises he could not have kept on his best day. There was a great deal of Dmitri in every room he entered. The trouble was that he never quite left, even after the door had closed behind him.',
      ]),
      ch(5, 'A Knock at Midnight', [
        'They came for him at midnight, because such visits, in our district, are always made at midnight. He stood in the doorway in his shirt sleeves and stared at the men on the step. And he said, before any of them spoke, "I have been expecting you."',
      ]),
    ],
  },

  // 21 — One Hundred Years of Solitude
  21: {
    totalPages: 417,
    chapters: [
      ch(1, 'Macondo', [
        'The village rose out of the swamp like a thought someone had only half finished, and for many years afterward the people who lived there continued, in small and unhurried ways, to finish it.',
        'There were no streets at first, only paths between the houses. There were no clocks at first, only the rooster\'s voice in the morning and the long blue afternoon. There were no histories at first — only stories, and the stories belonged to whoever told them last.',
      ]),
      ch(2, 'The Gypsies Arrive', [
        'They came once a year, with mirrors that burned, with magnets that pulled the nails out of the walls, with maps of countries no one in the village had ever heard of. The children watched. The grown men watched. And by the time the gypsies left, the village was, in some small but unmistakable way, no longer the village it had been.',
      ]),
      ch(3, 'Ursula', [
        'She kept the house standing. She kept the family fed. She kept the small candle of common sense burning in a household where common sense was, on most days, in short supply. She would, in time, be remembered as the oldest woman in Macondo. She would, also, deserve it.',
      ]),
      ch(4, 'A Rain That Did Not Stop', [
        'The rain began on a Tuesday, and the rain continued, and after a while no one in the village could remember which Tuesday it had begun on. Roofs sagged. Floors warped. Letters from the outside world arrived too damp to read. And still, somewhere above the clouds, the rain went on with its private and unfinished business.',
      ]),
      ch(5, 'The Yellow Butterflies', [
        'They appeared first in twos. Then in dozens. Then in such numbers that no one in the kitchen could quite see across the kitchen anymore. They followed certain people the way affection follows certain people. They left, eventually. Not all of them. But enough that the kitchen, by August, was once again only a kitchen.',
      ]),
    ],
  },

  // 22 — The Odyssey
  22: {
    totalPages: 541,
    chapters: [
      ch(1, 'A Man of Many Turnings', [
        'Sing in me, Muse, of the man of many turnings — the man who, after the great city was burned, set out for home across a sea that had its own opinion of him, and who arrived at last, after long years and longer hardships, having lost almost everything but his name.',
        'On the island of Ithaca, his house was full of strangers who ate his food and courted his wife and had, by now, nearly forgotten that the master of the house had ever existed at all. Telemachus, his son, was old enough to remember. Just barely.',
      ]),
      ch(2, 'The Lotus Eaters', [
        'They tasted the fruit, and they forgot — not all at once, but slowly, the way one forgets a song one used to know. They forgot the road home. They forgot the names of their wives. They forgot, by degrees, even the shape of their own old lives. He dragged them back to the ships himself, and tied them to the rowing benches, and sailed away while they wept.',
      ]),
      ch(3, 'The Cave of the Cyclops', [
        'The cave was vast and dim and smelled of sheep. They lit a fire. They roasted a meal. And then, from the back of the cave, came a footstep — a single footstep — that made every man on the floor stop chewing and reach, very quietly, for his sword.',
      ]),
      ch(4, 'Calypso', [
        'She offered him an island and a long quiet life and the absence of the years that take a man\'s strength away. He said no. He said it gently, because she had been kind to him. He said it firmly, because some things a man can refuse only firmly, or not at all.',
      ]),
      ch(5, 'The Bow', [
        'No man in the hall could string it. They tried, one by one. They braced it against their knees. They strained until their faces went red. And then — at the doorway, in the dust, in the clothes of a beggar — a small old stranger asked, very politely, whether he might be allowed a turn.',
      ]),
    ],
  },

  // 23 — The Stranger
  23: {
    totalPages: 123,
    chapters: [
      ch(1, 'Mother Died Today', [
        'Mother died today. Or perhaps yesterday — I don\'t know. I received a telegram from the home: "Your mother passed away. Funeral tomorrow. Faithfully yours." It doesn\'t say. It might have been yesterday.',
        'The bus to the home was hot, and the seat beside me was empty, and the road stretched on through the white afternoon without offering any particular feeling to attach to the journey. I noticed this. I did not, particularly, mind it.',
      ]),
      ch(2, 'A Sunday by the Sea', [
        'The sun was very white. The sea was very blue. The sand burned a little through the soles of my shoes, and I noticed that, too, and did not adjust the way I was walking. There were people around me. I do not remember most of them.',
      ]),
      ch(3, 'A Shot', [
        'The sun was on the blade. The sun was on my forehead. The sun was on everything, and the heat had a kind of weight to it — a weight that pressed down on the day until the day had no choice but to do something. So the day did. And so, perhaps, did I.',
      ]),
      ch(4, 'The Trial', [
        'They spoke of me as if I were not in the room. They spoke of my mother\'s funeral, of my swim that afternoon, of the cigarette I had smoked beside the coffin. I listened. I did not, particularly, defend myself. The defense, in any case, was being conducted by someone else.',
      ]),
      ch(5, 'The Last Evening', [
        'For the first time in a very long time, I let the gentle indifference of the world wash over me. The night, the stars, the small wind through the bars of the high window — none of it owed me anything. None of it ever had. And there was, in that, a kind of peace I had not been expecting.',
      ]),
    ],
  },

  // 24 — Fahrenheit 451
  24: {
    totalPages: 249,
    chapters: [
      ch(1, 'It Was a Pleasure to Burn', [
        'It was a pleasure to burn. It was a pleasure to see things eaten, to see things blackened and changed. With the brass nozzle in his fists, with this great python spitting its venomous kerosene upon the world, the blood pounded in his head, and his hands were the hands of some amazing conductor playing all the symphonies of blazing and burning.',
        'Montag walked home, helmet still warm, and the small lights of the houses along his street looked, for a moment, very fragile — like things that knew, somehow, what he did for a living.',
      ]),
      ch(2, 'A Girl Named Clarisse', [
        'She walked beside him as if walking were a thing one did for pleasure, and not — as everyone else now did it — merely a thing one did to get somewhere. She asked questions no one had ever bothered to ask him. By the time they reached his gate, he was not entirely sure who he was anymore.',
      ]),
      ch(3, 'The House That Would Not Burn', [
        'The old woman would not leave the house. They begged her. They warned her. They poured the kerosene anyway, because that was, in the end, the job. And she stood there, in the middle of her books, and she struck the match herself. He never quite forgot the sound it made.',
      ]),
      ch(4, 'The Hidden Books', [
        'He had taken them home one by one, over months, hiding each one in a place he was sure he would never check again. That, of course, was a lie he had been telling himself. He checked them every night.',
      ]),
      ch(5, 'A Fire on the Horizon', [
        'They walked along the river in a line, men he did not know, each one carrying — inside himself — a single book remembered word for word. The city behind them burned, soft and far, like a sunset that had forgotten to end. They walked on. Someone would have to remember. They had agreed to be the ones.',
      ]),
    ],
  },
};

export function getBookContent(bookId: number, bookPages: number | null | undefined): BookContent {
  const found = BOOK_CONTENTS[bookId];
  if (found) return found;
  return {
    totalPages: bookPages ?? 320,
    chapters: [
      ch(1, 'A Quiet Beginning', FALLBACK_OPEN),
      ch(2, 'First Light', FALLBACK_OPEN),
      ch(3, 'A Turning', FALLBACK_OPEN),
    ],
  };
}
