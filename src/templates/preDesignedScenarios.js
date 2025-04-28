// Pre-designed character and scenario templates

export const preDesignedScenarios = [
  {
    id: "betrayal-melody",
    title: "Betrayal's Melody",
    description: "A struggling musician discovers his girlfriend's betrayal and must find his voice amid the pain.",
    character: {
      name: "Unnamed Character",
      age: "19",
      physicalDescription: "At 19, I possess the chiselled physique of a fitness model – broad shoulders tapering to a narrow waist, defined muscles moving fluidly beneath tanned skin. My face commands attention: angular jawline, piercing blue eyes that shift between ice and ocean, and tousled dark hair that falls just right without effort. Most days I'm in worn jeans and plain white tees that stretch across my chest, a stark contrast to the sensitivity I hide. I'm also very well endowed.",
      background: "I grew up in a double-wide trailer outside Pikeville, Kentucky – deep in coal country where hollers cut between ancient mountains and poverty runs as deep as the coal seams. Our home sat isolated at the end of Blackberry Creek Road, rusting on cinder blocks amid scrubby pines, a metal box of secrets where I learned to walk on silent feet. Behind closed doors lives a gifted musician nobody knows exists. My fingers craft melodies that could move mountains; my voice blends Stapleton's soul with Cash's gravity, honed during stolen moments when Dad passed out drunk. Mom died bringing me into this world, and Dad never let me forget the price of my existence. \"You killed the only thing worth loving,\" he'd slur before his fists found me. So I built this body as armour, focused rage into muscle, kept my guitar hidden beneath the trailer's loose floorboards. The welts and scars Dad left aren't just on my skin – they're wrapped around my voice, choking every note before it can escape. My songs remain trapped inside, a secret I've never had the courage to share with anyone.",
      personality: "Quiet and reserved on the surface, with deep emotional sensitivity hidden beneath a tough exterior. Determined and hardworking, willing to sacrifice for others. Creative and musically gifted but struggling with self-doubt and the emotional scars of abuse. Loyal to those few I trust.",
      relationships: [
        {
          name: "Shay",
          relationshipType: "Girlfriend/Ex-girlfriend",
          description: "Shay was my high school sweetheart, the only one who knew about Dad's abuse. When neither of us could afford university, I stayed behind to work double shifts while she pursued her education across the country. I pour every penny into her future, believing in her success more than my own. She's been gone for almost a year now and has texted regularly, but over the last 4 months her texts and video calls have been inconsistent and she doesn't seem to answer."
        },
        {
          name: "Father",
          relationshipType: "Abusive Parent",
          description: "An alcoholic who became abusive after my mother died in childbirth. Blames me for her death and regularly reminds me of it."
        }
      ],
      additionalNotes: "I work two full-time jobs to support Shay's education. I'm a gifted musician who hides my talent. In rare moments alone, I sometimes take out my guitar and imagine a different life – one where I could share my music without fear. But that dream feels as distant as Shay does these days."
    },
    scenario: {
      title: "Betrayal's Melody",
      setting: {
        location: "My bedroom in the trailer in Pikeville, Kentucky",
        time: "Late night, after an 18-hour workday",
        atmosphere: "Dark, tense, emotionally charged"
      },
      initialSituation: "Our scenario starts when I'm on my bed in my single room after 18 hours of working. I tried texting her tonight and get no answer... Suddenly, I get a Snapchat message from her... When I open it, I see a photo of my girlfriend on her knees. Her eyeliner is running, her checks are red and smiling and her lips are wrapped around a large black penis. The caption says. \"She's a little busy right now bro 💦 video call her if you want a good show 😈\" Like an idiot I video call. \"There are three other black men in the background.\" I find out She's been doing this for months, chasing ever more aggressive thrills. Dropped out of college, she's wasting the money I send on drugs and hookups with random men. I hang up after the men insult me and I block her. We're starting right after I hang up the video call and realize the implications.",
      otherCharacters: [
        {
          name: "Shay",
          role: "Ex-girlfriend/Betrayer",
          description: "Once my high school sweetheart, now revealed to be leading a secret life of promiscuity and substance abuse.",
          relationship: "Former girlfriend who I supported financially, trusted completely, and who has just betrayed me in the most painful way possible."
        }
      ],
      narrativeGoals: "I want to explore how my character takes this incredible pain and betrayal and turns it into music and hopefully a career. One day at a time, with authentic responses and reactions. A journey from betrayal to finding my voice and potentially success through music.",
      toneAndThemes: "Raw emotion, resilience, finding one's voice, transforming pain into art, self-discovery, healing from betrayal, building a new life. The tone should be authentic - devastating pain initially, but gradually finding hope and purpose."
    }
  },
  {
    id: "detective-noir",
    title: "The Case of the Missing Heiress",
    description: "A hard-boiled detective in 1940s London takes on a case that will test his skills and morality.",
    character: {
      name: "Jack Marlowe",
      age: "42",
      physicalDescription: "Tall and weathered, with shoulders slightly hunched from years of carrying other people's burdens. My face bears the lines of too many late nights and not enough answers. Grey peppers my dark hair at the temples, and I keep a perpetual three-day stubble. My eyes—deep brown and watchful—miss little, though they've seen too much. I dress in well-worn suits, always with a loose tie and a battered fedora that's seen better days. A small scar runs along my right jaw, a souvenir from the war that I never discuss.",
      background: "Born in London's East End to a police constable father and a seamstress mother, I learned early that justice and reality rarely align. After serving in intelligence during the war, I returned to find a city I barely recognised, full of shadows and secrets. Unable to adjust to police bureaucracy, I set up as a private investigator, working from a small office above a tobacconist in Soho. My name has become known in certain circles—both high and low—as someone who can be trusted to find the truth, even when it's ugly. I've seen the worst of humanity, solved cases the police couldn't touch, and carried more secrets than a priest at confession. The bottle of whisky in my desk drawer helps with the nightmares.",
      personality: "Cynical but with a hidden core of idealism. Observant, patient, and tenacious when on a case. I maintain a facade of detachment, but injustice—especially against the vulnerable—cuts deep. I have a dry, sardonic wit and trust few people. Years of investigating humanity's darker impulses have left me expecting the worst, but I still hope to be surprised by the best.",
      relationships: [
        {
          name: "Inspector Thomas Reid",
          relationshipType: "Police Contact/Former Colleague",
          description: "We served together during the war before he joined Scotland Yard. He provides me information when cases overlap, and I occasionally do the same. Our friendship persists despite his disapproval of my methods."
        },
        {
          name: "Vivian Knight",
          relationshipType: "Secretary/Assistant",
          description: "More perceptive and capable than anyone gives her credit for. She manages my office, screens clients, and occasionally provides insights that crack cases wide open. She knows more about my past than anyone else, though neither of us acknowledges it."
        }
      ],
      additionalNotes: "I have a remarkable memory for details and faces. I keep a journal of unsolved cases that I revisit periodically. Despite my cynicism, I've never taken a case I believed to be morally wrong, though I've been offered substantial sums to do so."
    },
    scenario: {
      title: "The Case of the Missing Heiress",
      setting: {
        location: "London, 1947",
        time: "Winter - cold, foggy days and long, dangerous nights",
        atmosphere: "Post-war noir, atmospheric, morally ambiguous"
      },
      initialSituation: "It begins with a knock at my office door well after hours. Lord Edmund Blackwood, one of the wealthiest men in England, enters with an offer I should refuse but can't afford to. His daughter, Elizabeth, has vanished from her boarding school three days ago. The police suspect she's run off with a lover, but Blackwood insists there's more to it—a ransom note with details only someone close to the family would know. He wants discretion, which is why he's come to me instead of making a spectacle with the authorities. As he leaves, he mentions that his business partner's son was the last to see Elizabeth, information he's withheld from the police. I sense he's not telling me everything, but the substantial advance he leaves on my desk means his secrets are now my problem. The scenario begins as I arrive at the prestigious Thornfield School for Young Ladies, where the headmistress awaits with barely disguised disdain for my presence.",
      otherCharacters: [
        {
          name: "Lord Edmund Blackwood",
          role: "Client",
          description: "Aristocratic industrialist with political connections. Cold, controlling, and concerned with appearances above all.",
          relationship: "Employer who doesn't fully trust me but needs my discretion."
        },
        {
          name: "Elizabeth Blackwood",
          role: "Missing Person",
          description: "19-year-old heiress, reportedly rebellious but brilliant. Recently engaged to her father's business partner's son.",
          relationship: "The subject of my investigation."
        },
        {
          name: "Richard Pembroke",
          role: "Elizabeth's Fiancé",
          description: "Charming, Oxford-educated son of Blackwood's business partner. The engagement was arranged, but he claims they were genuinely in love.",
          relationship: "Person of interest, last to see Elizabeth."
        },
        {
          name: "Mrs. Hartley",
          role: "Headmistress of Thornfield School",
          description: "Strict disciplinarian concerned with the school's reputation. Clearly hiding something about the night of the disappearance.",
          relationship: "Reluctant witness."
        }
      ],
      narrativeGoals: "I want to unravel a mystery that grows increasingly complex, where nothing is as it seems. As I investigate, I'll discover connections to post-war black markets, family secrets, and possibly political corruption. I expect moral dilemmas where the truth might harm innocent people, testing my own code of ethics.",
      toneAndThemes: "Classic noir detective story with themes of post-war disillusionment, class conflict, appearances versus reality, and the price of truth. The tone should be atmospheric, morally complex, with moments of genuine danger."
    }
  },
  {
    id: "space-explorer",
    title: "First Contact: The Proxima Expedition",
    description: "The first human expedition to Proxima Centauri b encounters mysterious alien ruins and must unravel their secrets.",
    character: {
      name: "Dr. Eleanor Chen",
      age: "36",
      physicalDescription: "I stand at average height with an athletic build honed by years of astronaut training. My East Asian features are framed by close-cropped black hair with a streak of premature grey—a souvenir from the stress of designing the antimatter containment system that powers our ship. Dark, analytical eyes miss little, and laugh lines suggest a humour that balances my scientific intensity. Years in spacecraft and research facilities have left my skin pale, and I move with the deliberate precision of someone accustomed to environments where mistakes can be fatal. A small scar runs across my right eyebrow—a reminder of the lab accident that nearly ended my career before it began.",
      background: "Born to Chinese-British immigrant parents, both scientists, I was raised in the academic enclave of Cambridge. My childhood was spent between university laboratories and the English countryside, where I developed both analytical precision and a sense of wonder at the natural world. By 25, I had dual PhDs in xenobiology and quantum engineering—fields that barely existed when I began studying them. My theoretical work on potential alien biochemistry caught NASA's attention, leading to my recruitment for the Proxima mission. The journey to becoming the mission's science officer required another decade of specialised training, from spacecraft systems to extreme environment survival. Throughout this time, I maintained few personal connections—partly due to focus on my work, partly from the knowledge that a five-year mission to another star system would sever such ties. What few know is that my drive stems partly from tragedy: my younger brother's death from a rare genetic disorder sparked my interest in alternative biochemistries and the possibility that solutions might exist beyond Earth.",
      personality: "Methodical and analytical, with an insatiable curiosity that occasionally overrides caution. I approach new situations with scientific detachment initially, but this masks a deep capacity for wonder. I'm uncomfortable with authority for its own sake, preferring decisions based on evidence and reason. In crisis situations, I become intensely focused and decisive, though I struggle with improvisation. My humour tends toward the dry and sardonic, often emerging in tense situations as a coping mechanism. While I form connections slowly, those I make are deep and lasting.",
      relationships: [
        {
          name: "Commander Marcus Wells",
          relationshipType: "Superior Officer/Expedition Leader",
          description: "A decorated former military pilot with hundreds of space hours, Wells leads our five-person expedition. Our relationship is one of professional respect with underlying tension—he values order and chain of command, while I prioritise scientific discovery, leading to occasional conflicts about mission priorities."
        },
        {
          name: "Dr. Sanjay Kapoor",
          relationshipType: "Colleague/Friend",
          description: "The expedition's medical officer and my closest friend aboard ship. We bonded during training over shared scientific curiosity and an outsider perspective. He's more personable and emotionally intuitive than I am, often helping me navigate the human elements of our mission."
        },
        {
          name: "Lieutenant Zofia Nowak",
          relationshipType: "Colleague/Potential Romantic Interest",
          description: "Our security and engineering specialist. Though we clashed initially due to different approaches—her practical engineering versus my theoretical science—I've grown to admire her resourcefulness and directness. There's an unacknowledged attraction between us, complicated by the mission parameters and professional boundaries."
        }
      ],
      additionalNotes: "I keep a small jade pendant that belonged to my brother, my one sentimental object. I'm a classically trained pianist and sometimes play on the small keyboard I brought aboard to maintain dexterity in my hands. Despite years of study focused on potential alien life, I'm conscious that my theories could be completely upended by actual contact—a prospect both terrifying and exhilarating."
    },
    scenario: {
      title: "First Contact: The Proxima Expedition",
      setting: {
        location: "Proxima Centauri b, the first potentially habitable exoplanet explored by humans",
        time: "2097, three days after landing on the planet's surface",
        atmosphere: "Scientific expedition, mysterious, filled with wonder and underlying tension"
      },
      initialSituation: "Our five-person crew has established base camp in a valley near what appears to be artificial structures—geometric forms too regular to be natural, partially buried under celadon vegetation. Initial scans show no signs of current inhabitants or technology emissions, but the structures are clearly not natural formations. As science officer, I've been documenting the ruins and collecting samples of the local flora, which shows remarkable similarities to Earth plants despite evolving independently. Yesterday, during a routine exploration, I discovered what appears to be an entrance to the subterranean portion of the ruins. The scenario begins as Commander Wells has finally granted permission for an exploratory team—myself, Lt. Nowak, and Dr. Kapoor—to enter the structure, while he and our pilot maintain base camp and communications. We've just activated our lights at the threshold of the entrance, revealing walls covered in patterns that could be decorative or linguistic. The air inside smells strangely familiar, despite being on a world 4.2 light years from Earth.",
      otherCharacters: [
        {
          name: "Commander Marcus Wells",
          role: "Expedition Leader",
          description: "Former military pilot, pragmatic and focused on crew safety above scientific discovery. Bears the weight of command and responsibility for humanity's first interstellar mission.",
          relationship: "My superior officer whose caution sometimes conflicts with my scientific curiosity."
        },
        {
          name: "Dr. Sanjay Kapoor",
          role: "Medical Officer",
          description: "Brilliant xenobiologist with specialty in comparative biology. Warm, diplomatic, and spiritually inclined despite his scientific training.",
          relationship: "Close friend and scientific collaborator who helps bridge the gap between my analytical approach and the human elements of our mission."
        },
        {
          name: "Lieutenant Zofia Nowak",
          role: "Security/Engineering Specialist",
          description: "Former military engineer with practical problem-solving skills and combat training. Direct, resourceful, and physically capable.",
          relationship: "Colleague with whom I share an unacknowledged attraction, complicated by professional boundaries."
        },
        {
          name: "Alex Rivera",
          role: "Pilot/Communications Officer",
          description: "Youngest crew member, responsible for our spacecraft and maintaining contact with Earth. Enthusiastic but sometimes overconfident.",
          relationship: "Most distant professional relationship among the crew, as our areas of expertise rarely overlap."
        }
      ],
      narrativeGoals: "I want to explore the ancient alien ruins and uncover their purpose, possibly discovering evidence of what happened to their creators. As we delve deeper, I expect to face both scientific puzzles and interpersonal challenges within our small crew. The discoveries we make could fundamentally change humanity's understanding of our place in the universe, while the dangers—both physical and psychological—of being the first humans on an alien world will test our resilience and unity.",
      toneAndThemes: "Scientific discovery, mystery, and wonder balanced with tension and the isolation of being further from home than any humans in history. Themes include the search for understanding across vast differences, the meeting of science and wonder, and how exploration changes the explorers. The tone should blend analytical problem-solving with moments of awe, interpersonal drama, and the underlying tension of the unknown."
    }
  }
];
