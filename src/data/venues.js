export var VENUES = [
  // ─── GRANDS MUSEES & GALERIES (major) ───
  {
    id: 'v1', name: 'Le Louvre', category: 'expo', major: true,
    latitude: 48.8606, longitude: 2.3376,
    address: 'Rue de Rivoli, 75001',
    image: require('../../assets/events/louvre.jpg'),
    upcoming: [
      { title: 'Vermeer & les maitres hollandais', date: 'Avr 2026' },
      { title: 'La Victoire de Samothrace restauree', date: 'Permanent' },
    ],
  },
  {
    id: 'v2', name: 'Grand Palais', category: 'expo', major: true,
    latitude: 48.8661, longitude: 2.3125,
    address: '3 Av. du General Eisenhower, 75008',
    image: null,
    upcoming: [
      { title: 'Art Paris Fair', date: 'Avr 2026' },
      { title: 'Design Parade Paris', date: 'Juin 2026' },
    ],
  },
  {
    id: 'v3', name: "Musee d'Orsay", category: 'expo', major: true,
    latitude: 48.8600, longitude: 2.3265,
    address: "1 Rue de la Legion d'Honneur, 75007",
    image: require('../../assets/events/orsay.avif'),
    upcoming: [
      { title: 'Renoir et l\'amour', date: 'Mars - Juil 2026' },
      { title: 'Monet et la lumiere', date: 'Sept 2026' },
    ],
  },
  {
    id: 'v4', name: 'Centre Pompidou', category: 'expo', major: true,
    latitude: 48.8607, longitude: 2.3522,
    address: 'Place Georges-Pompidou, 75004',
    image: require('../../assets/events/pompidou.jpg'),
    upcoming: [
      { title: 'Collection permanente', date: 'Permanent' },
      { title: 'Sonic Youth — exposition', date: 'Mai 2026' },
    ],
  },
  // ─── MUSIQUE & OPERA (major) ───
  {
    id: 'v5', name: 'Opera Bastille', category: 'musique', major: true,
    latitude: 48.8529, longitude: 2.3692,
    address: 'Pl. de la Bastille, 75012',
    image: require('../../assets/events/opera.png'),
    upcoming: [
      { title: 'La Traviata', date: 'Avr 2026' },
      { title: 'Romeo et Juliette', date: 'Mai 2026' },
    ],
  },
  {
    id: 'v6', name: 'Philharmonie de Paris', category: 'musique', major: true,
    latitude: 48.8894, longitude: 2.3964,
    address: '221 Av. Jean Jaures, 75019',
    image: require('../../assets/events/philharmonie.jpg'),
    upcoming: [
      { title: 'Orchestre de Paris', date: 'Mars 2026' },
      { title: 'Nuit du Jazz', date: 'Avr 2026' },
    ],
  },
  {
    id: 'v7', name: "L'Olympia", category: 'musique', major: true,
    latitude: 48.8712, longitude: 2.3278,
    address: '28 Bd des Capucines, 75009',
    image: null,
    upcoming: [
      { title: 'Soiree Chanson Francaise', date: 'Avr 2026' },
      { title: 'Jazz en Mai', date: 'Mai 2026' },
    ],
  },
  // ─── THEATRE (major) ───
  {
    id: 'v8', name: 'Theatre du Chatelet', category: 'theatre', major: true,
    latitude: 48.8591, longitude: 2.3468,
    address: '1 Pl. du Chatelet, 75001',
    image: require('../../assets/events/chatelet.jpg'),
    upcoming: [
      { title: 'Les Miserables — comedie musicale', date: 'Avr 2026' },
      { title: 'Gala de danse', date: 'Mai 2026' },
    ],
  },
  {
    id: 'v9', name: 'Theatre de la Ville', category: 'theatre', major: false,
    latitude: 48.8534, longitude: 2.3488,
    address: '2 Pl. du Chatelet, 75001',
    image: null,
    upcoming: [
      { title: 'Hamlet — nouvelle mise en scene', date: 'Avr 2026' },
      { title: 'Festival Automne a Paris', date: 'Oct 2026' },
    ],
  },
  {
    id: 'v10', name: 'Comedie-Francaise', category: 'theatre', major: true,
    latitude: 48.8636, longitude: 2.3368,
    address: 'Pl. Colette, 75001',
    image: null,
    upcoming: [
      { title: 'Le Misanthrope — Moliere', date: 'Avr 2026' },
      { title: 'Cyrano de Bergerac', date: 'Mai 2026' },
    ],
  },
  // ─── EXPERIENCES IMMERSIVES ───
  {
    id: 'v11', name: 'Palais de Tokyo', category: 'immersif', major: false,
    latitude: 48.8644, longitude: 2.2996,
    address: '13 Av. du President Wilson, 75116',
    image: null,
    upcoming: [
      { title: 'Exposition Collective Ete', date: 'Juin 2026' },
      { title: 'Nuit Blanche', date: 'Oct 2026' },
    ],
  },
  {
    id: 'v12', name: 'Paradox Museum', category: 'immersif', major: false,
    latitude: 48.8698, longitude: 2.3476,
    address: 'Paris 2e',
    image: null,
    upcoming: [],
  },
  {
    id: 'v13', name: 'Bercy Village', category: 'immersif', major: false,
    latitude: 48.8337, longitude: 2.3863,
    address: 'Cour Saint-Emilion, 75012',
    image: null,
    upcoming: [
      { title: 'Exposition Mers & Oceans', date: 'Ete 2026' },
    ],
  },
  // ─── STREET ART ───
  {
    id: 'v14', name: 'Fluctuart', category: 'street', major: false,
    latitude: 48.8612, longitude: 2.3053,
    address: '2 Port du Gros Caillou, 75007',
    image: null,
    upcoming: [
      { title: 'New Murals Season 2026', date: 'Mai 2026' },
    ],
  },
  {
    id: 'v15', name: 'Espace Oberkampf', category: 'street', major: false,
    latitude: 48.8648, longitude: 2.3790,
    address: 'Paris 11e',
    image: null,
    upcoming: [
      { title: 'Street Art Festival', date: 'Ete 2026' },
    ],
  },
  // ─── DEBATS & CONFERENCES ───
  {
    id: 'v16', name: 'Sciences Po — Amphi', category: 'debats', major: false,
    latitude: 48.8547, longitude: 2.3304,
    address: '27 Rue Saint-Guillaume, 75007',
    image: null,
    upcoming: [
      { title: 'Forum Monde Contemporain', date: 'Avr 2026' },
      { title: 'Rencontres Economiques', date: 'Mai 2026' },
    ],
  },
  {
    id: 'v17', name: 'Le Centquatre', category: 'debats', major: false,
    latitude: 48.8828, longitude: 2.3652,
    address: '5 Rue Curial, 75019',
    image: null,
    upcoming: [
      { title: 'Forum des Transitions', date: 'Avr 2026' },
      { title: 'Journee Architecture & Societe', date: 'Mai 2026' },
    ],
  },
  // ─── MUSIQUE (salle eglise) ───
  {
    id: 'v18', name: 'Eglise Saint-Eustache', category: 'musique', major: false,
    latitude: 48.8626, longitude: 2.3469,
    address: '2 Impasse Saint-Eustache, 75001',
    image: null,
    upcoming: [
      { title: 'Requiem de Mozart', date: 'Avr 2026' },
    ],
  },
  // ─── LIBRAIRIES & RENCONTRES ECRIVAINS ───
  {
    id: 'lb1', name: 'Shakespeare & Company', category: 'litterature', major: false,
    latitude: 48.8527, longitude: 2.3472,
    address: '37 Rue de la Bucherie, 75005',
    image: require('../../assets/events/shakespeare.jpg'),
    upcoming: [
      { title: 'Lecture by Colm Toibin', date: '14 Mars 2026' },
      { title: 'Poetry Night', date: '21 Mars 2026' },
      { title: 'Rencontre — Leila Slimani', date: 'Avr 2026' },
    ],
  },
  {
    id: 'lb2', name: 'Librairie Gallimard', category: 'litterature', major: false,
    latitude: 48.8509, longitude: 2.3267,
    address: '15 Bd Raspail, 75007',
    image: require('../../assets/events/galimard.jpg'),
    upcoming: [
      { title: 'Dedicase — Prix Goncourt 2025', date: '15 Mars 2026' },
      { title: 'Rencontre — Annie Ernaux', date: '28 Mars 2026' },
      { title: 'Soiree poesie contemporaine', date: 'Avr 2026' },
    ],
  },
  {
    id: 'lb3', name: 'Librairie La Compagnie', category: 'litterature', major: false,
    latitude: 48.8513, longitude: 2.3480,
    address: '58 Rue des Ecoles, 75005',
    image: require('../../assets/events/compagnie.jpg'),
    upcoming: [
      { title: 'Rencontre philosophie & societe', date: '18 Mars 2026' },
      { title: 'Debat : Camus aujourd\'hui', date: 'Avr 2026' },
    ],
  },
  {
    id: 'lb4', name: "L'Ecume des Pages", category: 'litterature', major: false,
    latitude: 48.8542, longitude: 2.3297,
    address: '174 Bd Saint-Germain, 75006',
    image: require('../../assets/events/ecume.jpg'),
    upcoming: [
      { title: 'Nuit de la litterature', date: '20 Mars 2026' },
      { title: 'Club de lecture mensuel', date: 'Avr 2026' },
    ],
  },
];
