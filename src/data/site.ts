export type Link = { label: string; href: string };
export const courses = {
  current: [
    { code: 'CENG567', name: 'Reinforcement Learning', note: 'Graduate course, Dr. Alper Demir' },
    { code: 'CENG461', name: 'Artificial Intelligence', note: '' },
    { code: 'CENG487', name: 'Introduction to Computer Graphics', note: '' },
  ],
  done: [
    { code: 'CENG463', name: 'Introduction to Machine Learning', grade: 'AA' },
    { code: 'CENG467', name: 'Natural Language Understanding and Generation', grade: 'BA' },
    { code: 'CENG218', name: 'Analysis and Design of Algorithms', grade: 'AA' },
    { code: 'CENG415/416', name: 'Senior Thesis and Seminar I, II', grade: 'AA, AA' },
    { code: 'CENG381', name: 'Stochastic Processes', grade: 'DC' },
    { code: 'CENG222', name: 'Probability and Statistics', grade: 'CB' },
    { code: 'CENG318', name: 'Human Computer Interaction', grade: 'BB' },
  ],
};
export const experience = [
  { when: 'Feb 2026 to present', role: 'Undergraduate Researcher', org: 'Digital Humanities and Artificial Intelligence Laboratory, IZTECH', url: 'https://dbb.iyte.edu.tr/site_en.html', text: 'Annotated and classified 257 Ottoman Turkish documents with an AI-assisted workflow, and built a ground-truth dataset for fine-tuning domain-specific language models.' },
  { when: 'Nov 2025 to Mar 2026', role: 'Website and Localization Specialist', org: 'Department of General Cultural Courses, IZTECH', url: 'https://gk.iyte.edu.tr/en/home-page/', text: 'Audited the department website, improved its structure, and closed the content gaps between its Turkish and English pages.' },
  { when: 'Jul to Sep 2025', role: 'AI Engineering Intern', org: 'Research Ecosystems, Teknopark Izmir', url: 'https://www.researchecosystems.com/', text: 'Turned a static chatbot workflow over a research database into a multi-agent system with LangGraph and PostgreSQL, tested it on bilingual question sets, then built GPT-Deep-Search for finding academic profiles.' },
  { when: 'Nov 2021 to Feb 2023', role: 'Game Developer and Designer', org: 'Teknopark Izmir', url: 'https://en.iyte.edu.tr/research/teknopark-izmir/', text: 'Joined after our 7-person team of preparatory-class students won 2nd prize at the Kuleizmir Game Hackathon with Smyrna Zindanları, and worked on game prototypes.' },
];
export const events = [
  { when: 'Jun 2026', name: 'Hugging Face Build Small Hackathon', text: 'Stage Whisper', url: 'https://huggingface.co/Build-Small-Hackathon' },
  { when: 'May 2025', name: 'IZTECH DuckJam', text: "Now, I'm Ducked Up!, a 2-person team", url: '' },
  { when: 'May 2022', name: "HoBI'22, Hackathon of BEST Isparta", text: 'Unchosen, a 3-person team', url: 'https://mobidictum.com/tr/?p=36953' },
  { when: '2022', name: 'Jamination 5, Dokuz Eylül University', text: 'ConfUsed, solo in about 8 hours', url: 'https://itch.io/jam/jamination-5' },
  { when: '2021', name: 'Kuleizmir Game Hackathon', text: '2nd prize with Smyrna Zindanları', url: 'https://bulten.iyte.edu.tr/2021/11/03/iyte-bilgisayar-muhendisligi-bolumu-hazirlik-sinifi-ogrencilerine-kuleizmir-game-hackathonundan-2ncilik-odulu/' },
];
const gh = (r: string) => [{ label: 'GitHub', href: `https://github.com/Anka256/${r}` }];
export const projects = [
  { name: 'Circle In', when: 'Nov 2026', tags: ['Games'], text: 'A reflex and timing game built around a shrinking circle, in development in Godot. It has a 120-level campaign and daily and endless modes, and online rankings are planned.', links: [], to: '/games/' },
  { name: 'Bounce In', when: 'Oct 2026', tags: ['Games'], text: 'A ball-drop puzzle on a whiteboard, made in Godot and now in testing. You launch the ball, earn from every bounce, and spend it on obstacles that reshape the board.', links: [], to: '/games/' },
  { name: 'Hunter-Gatherer Survival', when: 'Oct 2026', tags: ['Research', 'RL'], text: 'A finite MDP and Gymnasium environment for the graduate reinforcement learning course CENG567, where an agent must survive 30 days. It grows with each assignment, and multi-agent experiments come next.', links: [], to: '/research/hunter-gatherer/' },
  { name: 'Recognition', when: 'Oct 2026', tags: ['Research', 'RL'], text: 'A very small personal experiment built on a fork of SocialJax. I added one environment where agents earn reward only by being recognised by others, with a trainer, plots and tests.', links: gh('SocialJax/tree/recognition'), to: '/research/#recognition' },
  { name: 'Crossblocks', when: 'Sep 2026', tags: ['Games'], text: 'A falling-block game on a board split in two, released on Google Play. Pieces arrive from both sides and can wrap around the board, with online duels, themes and 11 store languages.', links: [{ label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.thearchitect256.crossblocks' }], to: '/games/' },
  { name: 'Hide and Seek', when: 'Sep 2026', tags: ['Research', 'RL'], text: 'A 1v1 physics environment trained from scratch with my own recurrent PPO and an asymmetric critic. The hider learned to stay out of sight, and the project is paused and unfinished.', links: [], to: '/research/hide-and-seek/' },
  { name: 'Text2SQL Agent', when: 'Aug 2026', tags: ['Agents'], text: 'A small LangGraph agent that turns natural language questions into SQL and runs them on a SQLite database. It loops between the model and a SQL tool, and keeps conversation history across turns.', links: gh('Text2SQL-Agent') },
  { name: 'Personal PDF Chatbot', when: 'Aug 2026', tags: ['LLM'], text: 'A Streamlit app for asking questions about any uploaded PDF. It extracts, chunks and embeds the document with LangChain and Chroma, then answers from the retrieved context with streaming responses.', links: gh('Personal-PDF-Chatbot') },
  { name: 'Customer Support System', when: 'Jul 2026', tags: ['Agents'], text: 'A ticket pipeline built for a company case study, covering validation, prompt injection screening, language detection, classification, drafting and confidence scoring. It uses LangGraph, FastAPI, PostgreSQL and a Streamlit review dashboard.', links: gh('Customer-Support-System') },
  { name: 'Triage Master', when: 'Jul 2026', tags: ['LLM', 'Agents'], text: 'A small router model for multi-agent pipelines, since routing is really a classification task. I fine-tuned Qwen3.5-2B with LoRA on 5,000 synthetic examples and reached 99.4% accuracy (497/500) on a held-out test set.', links: [{ label: 'Hugging Face', href: 'https://huggingface.co/TheArchitect256/qwen3.5-2b-triage-master' }] },
  { name: 'Stage Whisper', when: 'Jun 2026', tags: ['LLM'], text: 'An interactive AI theatre engine for the Hugging Face Build Small Hackathon, limited to models under 32B. It writes scripts, scenes, characters and voices in real time, and you can step in as director.', links: [{ label: 'Demo', href: 'https://huggingface.co/spaces/build-small-hackathon/stage-whisper' }] },
  { name: 'ToS Inspector', when: 'Jun 2026', tags: ['Agents', 'Tools'], text: 'A Chrome extension, published on the Chrome Web Store, that reads a site\'s Terms of Service and Privacy Policy for you. It finds the document on its own, trying known paths, then web search, then a headless browser. The text is split into chunks and analysed in parallel by LangGraph workers behind a FastAPI service. You get a 0 to 100 risk score and 7 categories rated from Green to Blocker, with direct quotes as evidence.', links: [...gh('ToS-Inspector'), { label: 'Chrome Web Store', href: 'https://chromewebstore.google.com/detail/tos-inspector/aajihdlemojmhiiacgakpkkmoocfpoik' }] },
  { name: 'Hermes Mobile', when: 'Jun 2026', tags: ['Agents', 'Tools'], text: 'A phone interface for my personal AI agent, built with Expo and React Native. It connects to the agent over Tailscale and works with my Obsidian notes, so I can use it from anywhere.', links: [] },
  { name: 'Personal Knowledge Graph', when: 'Jun 2026', tags: ['Tools'], text: 'A FastAPI and PostgreSQL service for creating and managing structured knowledge nodes. It adds pgvector search and an interactive Cytoscape.js graph view, and a rebuild is planned.', links: gh('my-knowledge-graph') },
  { name: 'Smart Zebra', when: 'May 2026', tags: ['Research', 'LLM'], text: 'My senior thesis, a prompt-to-GRPO recipe for logic-grid reasoning in small language models. I am first author, the work was funded by TÜBİTAK 2209-A, and the manuscript is in revision.', links: [], to: '/research/smart-zebra/' },
  { name: 'GameLM', when: 'Feb 2026', tags: ['Agents', 'LLM'], text: 'A chatbot about digital games built on LangChain and Ollama. An agent chooses between retrieval over game wikis with ChromaDB, the Steam API and web search to answer each question.', links: [] },
  { name: 'Ottoman Document Annotation', when: 'Feb 2026', tags: ['Research', 'LLM'], text: 'Work at the Digital Humanities and Artificial Intelligence Laboratory. I annotated and classified 257 Ottoman Turkish documents with an AI-assisted workflow and built a ground-truth dataset for fine-tuning language models.', links: [], to: '/research/#lab' },
  { name: 'Birdy', when: 'Jan 2026', tags: ['LLM'], text: 'A multimodal bird identification pipeline that accepts image, audio and text input. It recognises the species, then retrieves and summarises information about it using LangChain and Ollama.', links: gh('Birdy') },
  { name: 'Deep RL Course Models', when: 'Nov 2025', tags: ['RL'], text: 'My first trained reinforcement learning agents, published on Hugging Face. They include PPO on LunarLander with Stable-Baselines3, and my own Q-learning implementations on FrozenLake and Taxi.', links: [{ label: 'Hugging Face', href: 'https://huggingface.co/TheArchitect256' }] },
  { name: 'GPT-Deep-Search', when: 'Aug 2025', tags: ['Agents'], text: 'A multi-agent researcher discovery system built during my internship with the OpenAI Agents SDK. It searches sources such as WoS, Scopus and Google Scholar and aggregates academic profiles by defined criteria.', links: gh('GPT-Deep-Search') },
  { name: 'Research Database Chatbot', when: 'Jul 2025', tags: ['Agents'], text: 'Internship work at Research Ecosystems, turning a static chatbot workflow into a multi-agent LangGraph system over PostgreSQL. I tested it on bilingual question sets and improved it from the failures.', links: [] },
  { name: 'Movie Recommender', when: 'May 2025', tags: ['Tools'], text: 'A semantic movie recommender with a Gradio interface. It embeds plot summaries with a sentence-transformer model, stores them in Chroma, and uses a dataset enriched with emotion labels.', links: [] },
  { name: 'Acil Okey', when: 'Apr 2025', tags: ['Tools'], text: 'A location-based mobile app for finding players for okey games, with real-time matchmaking and chat. It was built by a 6-person agile team with React Native and Supabase.', links: [] },
  { name: 'ConfUsed', when: 'Jun 2022', tags: ['Games'], text: 'A PC puzzle-platformer made alone in about 8 hours at the Jamination 5 game jam, on the theme that every input does two things. I kept developing it afterwards with new mechanics.', links: [{ label: 'itch.io', href: 'https://alto256.itch.io/confused' }], to: '/games/' },
];
export const games = [
  { id: 'crossblocks', name: 'Crossblocks', status: 'On Google Play', cls: 'live', when: '2026', line: 'A falling-block game on a board split in two. Pieces arrive from both sides, and a reverse swipe wraps one around the board. Online duels, themes and 11 store languages.', shots: ['cb_play_neon', 'cb_clear_candy', 'cb_play_wood', 'cb_menu', 'cb_shop'], links: [{ label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.thearchitect256.crossblocks' }] },
  { id: 'bounce', name: 'Bounce In', status: 'Testing', cls: 'pause', when: '2026', line: 'A ball-drop puzzle on a whiteboard. Launch the ball, earn from every bounce, and spend it on obstacles that change the board.', shots: ['bi_01_play', 'bi_02_tower', 'bi_05_map', 'bi_03_stars'], links: [] },
  { id: 'circle', name: 'Circle In', status: 'In development', cls: 'work', when: '2026', line: 'A reflex and timing game built around a shrinking circle, with a 120-level campaign, daily challenges and online rankings planned.', shots: ['ci_t_l1', 'ci_t_menu', 'ci_tab_game_hold'], links: [] },
  { id: 'confused', name: 'ConfUsed', status: 'Older game', cls: '', when: '2022', line: 'A PC puzzle-platformer made alone in about 8 hours at the Jamination 5 game jam, on the theme "every input does 2 things". I kept developing it afterwards with new mechanics and design changes.', video: 'dlEUUkR40_w', shots: ['conf_4', 'conf_5', 'conf_2', 'conf_1'], links: [{ label: 'Play on itch.io', href: 'https://alto256.itch.io/confused' }, { label: 'GitHub', href: 'https://github.com/Anka256/ConfUsed' }] },
];
export const zebraSizes = [
  ['SFT, baseline', 57.81, 3.57, 0, 0, 35.32, 22.81],
  ['SFT, AC-3', 66.56, 9.64, 0.50, 0, 29.61, 14.28],
  ['GRPO bucketed, baseline', 54.69, 4.29, 0, 0, 36.38, 25.86],
  ['GRPO bucketed, AC-3', 42.50, 6.43, 0, 0, 35.59, 23.79],
  ['GRPO normalized, baseline', 60.94, 6.43, 0.50, 0, 37.89, 25.20],
  ['GRPO normalized, AC-3', 58.13, 3.57, 0.50, 0, 36.71, 25.28],
];
export const zebraTable = [
  ['Base, baseline prompt', 15.62, 50.96, 0, 26.91],
  ['Base, AC-3 prompt', 18.75, 53.06, 0, 22.60],
  ['SFT, baseline prompt', 57.81, 80.22, 3.57, 47.07],
  ['SFT, AC-3 prompt', 66.56, 83.47, 9.64, 52.88],
  ['GRPO bucketed, baseline', 54.69, 81.80, 4.29, 49.40],
  ['GRPO bucketed, AC-3', 42.50, 71.62, 6.43, 50.06],
  ['GRPO normalized, baseline', 60.94, 83.16, 6.43, 50.42],
  ['GRPO normalized, AC-3', 58.13, 82.36, 3.57, 48.42],
];
