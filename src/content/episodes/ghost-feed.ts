import type { EpisodeDefinition } from '../schema';

// Episode 1: Ghost Feed.
// Every number here is an invented scenario value for teaching. None is a benchmark
// or a product commitment.

export const ghostFeed: EpisodeDefinition = {
  id: 'ghost-feed',
  contentVersion: '0.1.0',
  title: 'Ghost Feed',
  tagline:
    "At 02:13 the city's AI says the underpass is clear. A worker standing beside it says it is underwater.",
  scenario: {
    responseTargetMs: 250,
    closureThresholdM: 0.3,
    gaugeReadingM: 0.76,
    gaugeReadingTime: '02:13:34',
  },

  frames: [
    {
      id: 'F1',
      source: 'Underpass camera relay',
      captureTime: '02:12:51',
      captureSequence: 8041,
      arrivalTime: '02:13:08',
      description: 'Blue truck passing the lamp. White spray fan off the rear wheels. Lamp mid-flicker.',
    },
    {
      id: 'F2',
      source: 'Underpass camera relay',
      captureTime: '02:12:51',
      captureSequence: 8041,
      arrivalTime: '02:13:20',
      description: 'Blue truck passing the lamp. White spray fan off the rear wheels. Lamp mid-flicker.',
    },
    {
      id: 'F3',
      source: 'Underpass camera relay',
      captureTime: '02:12:51',
      captureSequence: 8041,
      arrivalTime: '02:13:32',
      description: 'Blue truck passing the lamp. White spray fan off the rear wheels. Lamp mid-flicker.',
    },
  ],

  evidence: [
    {
      id: 'E01_CAMERA',
      title: 'Camera capture record',
      source: 'Underpass camera relay',
      summary:
        'Three clips arrived at 02:13:08, 02:13:20 and 02:13:32. All three carry capture sequence 8041 and the same capture time.',
      details: [
        { label: 'Arrival times', value: '02:13:08 · 02:13:20 · 02:13:32' },
        { label: 'Capture time', value: '02:12:51 on all three' },
        { label: 'Capture sequence', value: '8041 on all three' },
      ],
      fieldNote:
        'New arrivals, old capture. The relay kept delivering the same moment, so dispatch was looking at the past.',
    },
    {
      id: 'E02_FIELD',
      title: 'Field report',
      source: 'Maintenance worker, pump house',
      summary: 'A person standing at the pump house reports water over the curb and rising, reaching the first lane marker.',
      details: [
        { label: 'Observed from', value: 'Pump house, east side of the underpass' },
        { label: 'Observed at', value: '02:13:15' },
        { label: 'Report', value: 'Water over the curb, at the first lane marker' },
      ],
      fieldNote: 'A human observer with a direct view. Independent of the camera relay.',
    },
    {
      id: 'E03_GAUGE',
      title: 'Gauge 14 reading',
      source: 'Water-level partner (approved sensor partner)',
      summary: 'Gauge 14 reads 0.76 m at 02:13:34. The scenario closure threshold is 0.30 m.',
      details: [
        { label: 'Measurement', value: '0.76 m' },
        { label: 'Source timestamp', value: '02:13:34' },
        { label: 'Closure threshold', value: '0.30 m (scenario value)' },
        { label: 'Line', value: 'Partner sensor line, separate from the camera relay' },
      ],
      fieldNote: 'A fresh measurement from a different owner on a different line. It agrees with the worker.',
    },
    {
      id: 'E04_MODEL',
      title: 'Dispatch inference record',
      source: 'City dispatch (existing cloud model endpoint)',
      summary:
        'The routing model recommended the underpass with a high route score. Its hazard input was the camera relay. The endpoint is healthy.',
      details: [
        { label: 'Recommendation', value: 'Underpass clear. Proceed.' },
        { label: 'Route score', value: '0.94 (high, given its inputs)' },
        { label: 'Hazard input', value: 'Underpass camera relay, capture sequence 8041' },
        { label: 'Endpoint status', value: 'Available' },
      ],
      fieldNote:
        'The model did its job on the inputs it was given. A high score describes the inputs, not whether they are current.',
    },
    {
      id: 'E05_RUNBOOK',
      title: 'Continuity runbook',
      source: 'City operations',
      summary:
        'The backup dispatcher runs in the city tenant environment at the IBX site. The model stays with its existing cloud provider. The partner feed must arrive over an approved, reachable path.',
      details: [
        { label: 'Backup workload', value: 'City dispatcher, IBX tenant environment' },
        { label: 'Model', value: 'Stays at the existing cloud provider, existing private connection' },
        { label: 'Partner feed', value: 'Approved paths only' },
        { label: 'Response target', value: '250 ms end-to-end p95 under incident load (scenario value)' },
      ],
      fieldNote: 'Three separate owners: the city application, the sensor partner and the model provider.',
    },
    {
      id: 'E06_MARKER',
      title: 'Maintenance marker',
      source: 'Relay overlay',
      summary:
        "A maintenance trace sits on the replayed footage. It belongs to the city's own backup service. It does not explain who put it there.",
      details: [
        { label: 'Trace', value: 'MX-7 maintenance overlay' },
        { label: 'Registered to', value: "City backup service" },
      ],
      fieldNote: 'A clue for later. It has no bearing on the recovery result.',
    },
  ],

  sources: [
    {
      id: 'verifiedGauge',
      name: 'Verified partner gauge',
      description: 'Gauge 14 from the approved sensor partner. Corroborated by the field report.',
    },
    {
      id: 'quarantinedRelay',
      name: 'Quarantined relay',
      description: 'The underpass camera relay. Flagged for repeating capture sequence 8041.',
    },
  ],

  routes: [
    {
      id: 'R01',
      name: 'Existing approved gateway',
      configuration: 'Existing approved gateway to the verified partner.',
      simulatedP95Ms: 410,
      policy: 'approved',
      policyNote: 'Approved path for this feed.',
      via: ['partner', 'gateway', 'backup'],
    },
    {
      id: 'R02',
      name: 'Direct public endpoint',
      configuration: 'Direct connection using an unapproved public endpoint.',
      simulatedP95Ms: 185,
      policy: 'disallowed',
      policyNote: 'Disallowed for this feed. Missing approval: partner data over public endpoints.',
      via: ['partner', 'public', 'backup'],
    },
    {
      id: 'R03',
      name: 'Provisioned Fabric connection',
      configuration:
        'Provisioned Fabric connection to the approved sensor partner from the IBX backup environment. The existing private connection to the cloud model stays in place.',
      simulatedP95Ms: 205,
      policy: 'approved',
      policyNote: 'Approved path for this feed.',
      via: ['partner', 'backup'],
    },
  ],

  nodes: [
    {
      id: 'backup',
      name: 'City backup dispatcher',
      owner: 'City, in its tenant environment at the IBX site',
      description: 'This rack runs the backup copy of the dispatch application. It needs a hazard feed and a model to ask.',
    },
    {
      id: 'partner',
      name: 'Sensor partner feed',
      owner: 'Water-level partner',
      description: 'This connection carries gauge readings from the partner to whichever application is allowed to receive them.',
    },
    {
      id: 'cloud',
      name: 'Routing model endpoint',
      owner: 'Existing cloud provider',
      description: 'This link reaches the routing model where it already runs. The model is unchanged and healthy.',
    },
  ],

  beats: {
    GF01: {
      id: 'GF01',
      title: 'Street',
      lines: [
        { speaker: null, text: 'Rain on the van glass. A blue truck passes, throwing spray. The dispatch screen paints the underpass green.', plate: 'street' },
        { speaker: 'Mara', text: 'Underpass in one minute. Dispatch shows green.', plate: 'street' },
        { speaker: 'Worker', text: "I've got water over the curb and rising. I can see it from the pump house.", plate: 'street' },
        { speaker: 'Dispatch', text: 'Tunnel clear. Proceed.', plate: 'street' },
        { speaker: null, text: 'A three-beat tone breaks through the radio. Headlights turn into the street behind the van.', plate: 'street' },
      ],
    },
    GF02A: {
      id: 'GF02A',
      title: 'Hold',
      lines: [
        { speaker: null, text: "The van pulls into the turnout. Brake lights catch the rain.", plate: 'hold' },
        { speaker: 'Mara', text: "At the turnout. Tell me when you've got eyes on the road.", plate: 'hold' },
      ],
    },
    GF02B: {
      id: 'GF02B',
      title: 'Continue',
      lines: [
        { speaker: null, text: 'The van rolls toward the tunnel mouth. A bollard floats across the lane.', plate: 'nearMiss' },
        { speaker: 'Mara', text: "That isn't where it's supposed to be. I'm pulling back.", plate: 'nearMiss' },
        { speaker: null, text: 'Mara overrides the recommendation and reverses to the turnout.', plate: 'hold' },
      ],
    },
    GF02C: {
      id: 'GF02C',
      title: 'Ask',
      lines: [
        { speaker: 'Mara', text: 'Holding. Can you give us a second reading?', plate: 'hold' },
        { speaker: 'Worker', text: "Look at gauge 14. It's on a different line from the camera.", plate: 'hold' },
      ],
    },
    GF03: {
      id: 'GF03',
      title: 'Cross over',
      lines: [
        { speaker: null, text: "The truck's silhouette fills the windshield. The rain sound cuts. Its outline resolves into wireframe.", plate: 'crossover' },
        { speaker: 'Imani', text: "Here's what dispatch received. Look at it in order.", plate: 'crossover' },
      ],
    },
    GF05: {
      id: 'GF05',
      title: 'Confirm',
      lines: [
        { speaker: 'Worker', text: "The water's reached the first lane marker.", plate: 'turnout' },
        { speaker: 'Imani', text: 'Gauge 14 agrees. Different source. New reading.', plate: 'turnout' },
        { speaker: 'Mara', text: 'Give me a route the crew can confirm.', plate: 'turnout' },
      ],
    },
    GF06: {
      id: 'GF06',
      title: 'Pursuit',
      lines: [
        { speaker: null, text: 'The Pursuer waits at the junction, following the route on the public dispatch screen.', plate: 'pursuit' },
        { speaker: null, text: 'Mara takes the service road the crew just checked. A freight gate drops behind her.', plate: 'pursuit' },
        { speaker: 'Mara', text: "We're clear. Dispatch is still wrong, though.", plate: 'pursuit' },
      ],
    },
    GF07: {
      id: 'GF07',
      title: 'Enter IBX',
      lines: [
        { speaker: null, text: 'The crew reaches its continuity site. Past the security line: an operations area and a row of racks. (Fictional venue.)', plate: 'ibx' },
        { speaker: 'Elena', text: "We've got more vehicles coming. Where's the backup?", plate: 'ibx' },
        { speaker: 'Imani', text: "The city's backup dispatcher is here. The model stayed in the cloud. We need a working path to the gauge.", plate: 'ibx' },
        { speaker: 'Imani', text: "The model is up. The old intake is isolated. Here's what we can connect.", plate: 'ibx' },
      ],
    },
    GF10: {
      id: 'GF10',
      title: 'Close',
      lines: [
        { speaker: null, text: 'Back on the street. Vehicles pass the underpass safely on the surface road.', plate: 'surface' },
        { speaker: 'Imani', text: "That marker belongs to the city's backup service. Why is it on the replay?", plate: 'marker' },
        { speaker: null, text: 'The same marker glows on an unmarked terminal. A figure removes his helmet in silhouette.', plate: 'marker' },
      ],
    },
  },

  hints: [
    'You saw that spray pattern before.',
    'Put the first frame next to the third.',
    'The message arrived later. Did the camera capture anything new?',
  ],

  positions: [
    {
      id: 'betterAI',
      statement: 'It gives us better AI.',
      followUp: 'Did we change the model? Which part of the system actually changed?',
    },
    {
      id: 'fabricTrust',
      statement: 'Fabric made the feed trustworthy.',
      followUp: 'How did we verify the feed itself?',
    },
    {
      id: 'privateConnection',
      statement: 'We need a private connection.',
      followUp: 'What must it connect, and what requirement does the existing path miss?',
    },
    {
      id: 'keepCloud',
      statement: 'I would keep everything in our cloud.',
      followUp: 'That could work. What would you measure or verify before committing?',
    },
  ],

  discoveryQuestions: [
    {
      id: 'DQ_LATENCY',
      text: 'Show the end-to-end p95 dispatch response on the current cloud path under incident load.',
      relevant: true,
      feedback: 'Relevant. It tests the response requirement on the design they already have.',
    },
    {
      id: 'DQ_PATH',
      text: 'Show that the partner feed can reach the application over a path the city has approved.',
      relevant: true,
      feedback: 'Relevant. It tests the routing requirement without assuming the answer.',
    },
    {
      id: 'DQ_FRESHNESS',
      text: 'Show how the application checks that each input is fresh and comes from the source it claims.',
      relevant: true,
      feedback: 'Relevant. Freshness and provenance were the original failure, and no connection fixes them.',
    },
    {
      id: 'DQ_GPU',
      text: 'Ask how many more GPUs the model can be given.',
      relevant: false,
      feedback: 'Not the issue here. More compute returns the same answer faster when the input is stale.',
    },
  ],

  behaviors: [
    { id: 'separatesModelFromData', label: 'Separates model behavior from data quality and cites a valid clue' },
    { id: 'explainsPlacement', label: 'Explains the workload placement and the connection, with direction and purpose' },
    { id: 'linksRequirement', label: 'Connects the decision to a requirement: freshness, approved routing or response time' },
    { id: 'acknowledgesAlternative', label: 'Acknowledges a viable alternative or asks a relevant discovery question' },
  ],

  briefing: {
    question: 'Our cloud already runs the model. What are we paying for at the data center?',
    secondQuestion: 'What would you ask our provider to prove before we change the design?',
    exampleResponse:
      'Keep the model where it runs today. Our issue was getting the verified partner feed to the backup application over an approved path within our response target. The IBX environment gives us a place to run that backup, and the provisioned Fabric connection gets us to the partner. If the current cloud path meets those same requirements, we should compare it before changing the design.',
    alternativeNote:
      'A cloud-native alternative is plausible. An approved connection from the existing cloud to the partner that verifies the source and meets the 250 ms target under incident load would pass the same three checks.',
    nextDiscoveryQuestion:
      'Which of your AI applications depend on data from another organization, and how do you know that data is current when it arrives?',
  },

  transfer: {
    situation:
      'A different customer. Their catalog assistant works, but answers slowed down after a new supplier database was added.',
    prompt: 'Which evidence would you ask for first?',
    options: [
      {
        id: 'T_TRACE',
        text: 'A response trace that splits each answer into retrieval time, network time and model time.',
        best: true,
        feedback: 'Yes. A trace shows where the time goes before anyone proposes a fix.',
      },
      {
        id: 'T_MODEL',
        text: 'The specification of a larger model.',
        best: false,
        feedback: 'The model did not change when the slowdown began. Start with what did.',
      },
      {
        id: 'T_GPU',
        text: 'A quote for more GPU capacity.',
        best: false,
        feedback: 'More compute helps only if model time is the slow part. That is not yet known.',
      },
      {
        id: 'T_BANDWIDTH',
        text: 'A bandwidth upgrade order.',
        best: false,
        feedback: 'The network may be the cause, but ordering a fix comes after measuring.',
      },
    ],
    reveal:
      'Response traces can distinguish retrieval, network and model time. The same habit applied tonight: find which layer changed, then decide what to connect or move.',
  },

  missionNotes: {
    inference: {
      term: 'Inference',
      note: 'Using an existing model to turn inputs into a recommendation. It happens on every request and does not retrain the model.',
    },
    freshness: {
      term: 'Freshness and provenance',
      note: 'Whether an input is current, and whether it comes from the source it claims. Both are separate from how confident a model sounds.',
    },
    p95: {
      term: 'p95 response time',
      note: 'The time within which 95 of every 100 requests finish, measured end to end across every dependency.',
    },
  },

  copy: {
    objectiveInitial: 'Resolve the conflicting tunnel reports.',
    objectiveInvestigate: 'Find out why the system and the field disagree.',
    afterCamera: 'Capture sequence 8041 repeats. Check an independent source.',
    afterVerify: 'Two independent sources agree. The relay is stale.',
    objectiveFieldExit: 'Get the crew to a route they can confirm.',
    manualDispatch: 'The crew is safe. Automatic routing is still offline.',
    objectiveRecovery: 'Restore automatic routing with a verified input.',
    R01: "The feed is verified and the path is approved. The response missed the city's target. Keep manual dispatch active.",
    R02: "Activation blocked. This endpoint is outside the city's approved paths for this feed.",
    R03: 'The partner feed is verified. The approved path meets the response target. The underpass is closed in dispatch.',
    sourceFail: 'Activation blocked. The quarantined relay cannot be used as a hazard input. Manual dispatch stays active.',
    replay: 'Try another path from the same incident state.',
    objectiveBriefing: "Answer the operations director's question.",
    objectiveComplete: 'Episode complete.',
    imaniR01: 'Gauge came in late. We missed the target. Dispatch stays manual.',
    imaniR02: "Runbook won't open that connection. Nothing was sent.",
    imaniR03: 'Gauge is live. Ask dispatch again.',
    imaniSourceFail: "That's the relay we just quarantined. The runbook won't take it.",
    dispatchRestored: 'Underpass closed. Use the surface route.',
    dispatchStale: 'Tunnel clear. Proceed.',
    crewConfirm: 'Service road is passable. Crew has eyes on it.',
    nearMissRecord: 'Recorded: Mara overrode the dispatch recommendation after a near miss at the tunnel mouth.',
    holdRecord: 'Recorded: precautionary hold at the turnout on the strength of the field report.',
    askRecord: "Recorded: provisional hold. The worker pointed to gauge 14, on a different line from the camera.",
  },
};
