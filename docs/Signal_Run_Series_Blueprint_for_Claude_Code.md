# SIGNAL RUN
## Series bible and Claude Code build blueprint

**Status:** Concept and implementation specification. Version 1.0 • November 2026  
**Audience:** Equinix Sales and GTM learners, including people with no prior AI or networking knowledge.  
**First playable release:** Ghost Feed. A 12–15 minute single-player episode with cinematic scenes, an explorable Three.js world, and a working incident simulation.  
**Handoff:** Put this file in a private repository at `docs/Signal_Run_Series_Blueprint_for_Claude_Code.md`. Section 12 contains the initial Claude Code prompt.

---

## 1. The experience

At 02:13, a flood response vehicle is minutes from entering an underpass that the city's AI says is clear. A maintenance worker insists it's underwater. You enter a digital reconstruction of the city to look through the system's eyes. There, a truck drives past a camera three times in exactly the same way.

You decide what the crew does next. You inspect the data, confront the people involved, and choose which systems to reconnect. The next scene shows the consequences. Later, in an Equinix IBX data center, the crew puts together a recovery architecture that makes use of the cloud and partners the city already has.

**Creative reference:** The physical adventure and virtual-world transition of 1990s QuestWorld. Use original characters, story, voice, music, and world design. Build the contrast between hand-painted, human-scale physical scenes and a rendered 3D world that makes infrastructure and model behavior visible. The reference is an aesthetic and structural influence.

**The sales objective:** After playing, a seller should be able to explain how an AI application depends on a model, data, compute, and connectivity. They should be able to distinguish training from inference, ask where each workload and its data should live, and explain the particular reason an Equinix capability could improve a customer's design.

### Creative rules

1. **Open on a human problem.** Start with the van at risk. Keep the first decision inside the opening minute.
2. **Change the medium when you cross worlds.** Use cinematic motion panels for physical scenes. Give the player control of the camera and evidence inside the digital reconstruction.
3. **Make the lesson a discovery.** The player notices the truck loop before hearing a lesson about inference. Use the right technical name after the player has experienced what it means.
4. **Give the adversary a credible advantage.** He knows the architecture and anticipates hurried decisions. His moves surface assumptions the crew has to test.
5. **Let the player make useful mistakes.** Show the outcome, explain the cause, and let them replay from the decision. Preserve consequences that matter in the next scene.
6. **Make the Equinix reveal operational.** An IBX site is a physical location in the plot. The player still has to arrange compute, access to data, and private connections. The site and the links each do a different job.
7. **Make the buyer an ally with hard questions.** A customer objection is a legitimate constraint. Let the learner propose alternatives and state when an existing design is sufficient.
8. **Keep the two stakes visible.** Human safety and recovery of the service are separate. A player can put the crew in a safe state and still have work to do.

## 2. World, characters, and season arc

**Port Meridian** is a fictional coastal city with bridges, a flood-prone industrial district, a freight port, and a shared emergency operations center. Boroughs operate some of their own systems. City data, a partner-operated sensor feed, and model hosting are owned by different organizations. That split creates both the story's vulnerabilities and the opportunities to connect systems differently.

**The Reconstruction** is the crew's incident workspace. It visualizes recorded state: camera frames, timestamps, model inputs and outputs, dependencies, and routes. It has access only to connected telemetry, and stale or unknown evidence looks different from verified live evidence. It cannot reveal private facts that never entered those systems. A player crosses from watching the physical action into investigating its digital evidence.

| Character | Role and motivation | Performance and game behavior |
|---|---|---|
| The player | New incident coordinator. Keeps the crew safe and decides what evidence and tradeoffs justify recovery. | First person at the console. Expresses judgment by inspecting evidence, configuring the route, and briefing the city. |
| Mara Vale | Field lead and driver. Wants to get her crew and equipment to the people waiting for them. | Direct, clipped, protective. Trusts clear instructions grounded in evidence. Her physical actions reflect the player's decision. |
| Imani Park | Systems engineer who helped build the Reconstruction. Wants people to understand what the telemetry actually proves. | Curious, pragmatic. Gives prompts in escalating levels: look at the feed, compare frames, then compare timestamps. |
| Elena Ruiz | City operations director. Responsible for restoring service and explaining the cost and risk to the city. | Calm under pressure. Tests whether the design earns its complexity. She can accept the player's reasoning, accept with a condition, or ask a targeted follow-up. |
| Elias Voss | Former architect of the city emergency exchange. Plans to discredit the city's multi-provider recovery effort and force adoption of a single gateway he controls. | Precise and patient. Understands where systems fall back, what they trust, and when the team will feel rushed. He uses falsified signals, false leads, and compromised credentials in the fiction. |
| The Pursuer | Voss's distinctive masked field operative. Makes the physical hunt personal. | Recurs at transit hubs and the freight port. Presence is signaled by the same headlight pattern and three-beat radio tone. Keeps physical pressure on Mara while Voss goes after the system. |

**Season structure:** Each mission recovers a capability and exposes a clue about the exchange Voss wants to control. In Ghost Feed, the data loop leaves a diagnostic marker. In Heat Limit, the marker appears in a model delivery record. In Across the Line, the team finds that an apparently independent backup depends on the same gateway. In the finale, they recover the city by placing and connecting services in a way that removes that dependency. Show the freight evacuation concluding on screen. Leave the recovered evidence with the city, with the series able to move to a different industry in a later season.

**Visual signatures:** In the physical world use inky silhouettes, painted backgrounds, warm skin tones, and practical emergency lighting. Inside the Reconstruction use faceted geometry, charcoal blue, restrained cyan for system data, and amber for uncertainty. A matched object leads the transition each time. In the pilot, the wet windshield becomes the virtual camera plane. Use the current approved Equinix identity at the physical reveal and in the closing notes, with a text placeholder during development.

## 3. Season 1 mission designs

### E01 — Ghost Feed | AI fundamentals and trusted inputs

**Promise:** Find out why the system and the field disagree.  
**Player verbs:** Hold the vehicle, scrub footage, compare sources, route a feed, explain a decision.  
**Learning:** An existing model uses inputs to produce a prediction or recommendation. Freshness and provenance are separate from model confidence. Inference can happen repeatedly without training a new model.  
**Equinix role:** An approved workload environment in an IBX facility and a provisioned private Fabric connection to the sensor partner. The existing model host is retained.  
**Buyer objection:** “We already have a cloud provider. What does Equinix add here?”  
**Season clue:** A maintenance overlay identifies the source of the replay as part of a supposedly independent recovery service.  
**Build status:** Full pilot specification in Sections 4 and 5.

### E02 — Heat Limit | Training, inference, power, cooling

**Cold open:** A freight yard crane has dropped a container across the main evacuation lane. Voss's operative has taken the field crew's spare equipment. Night cameras have just come back online, and the old vision model performs poorly in rain and glare.

**Playable sequence:** Inspect six labeled frames and compare the currently deployed model with a previously validated low-light model. Choose what to put into service for the next convoy. Separately plan how to improve the model over time. In the scenario, the existing low-light model with a human review step clears the immediate need. A later tuning or training job requires labeled data, validation, and a suitable GPU environment. Give a smaller workload a plausible hosted alternative.

**Decision screen:** Three options for immediate deployment, with time to service and validation status. A second panel lets the learner place a future workload against a fixture of power density, cooling, capacity, lead time, and transfer constraints. Watch a convoy scene that reflects the immediate choice.

**Equinix role:** An AI-ready colocation option where the customer or a partner deploys compute. Show high-density power and cooling as placement conditions. Confirm location and availability in real sales discovery.  
**Buyer objection:** “Can we just buy GPUs?” A strong answer asks whether there is an immediate inference need or a longer model-development need, then checks power, cooling, data, and operating ownership.  
**Cliffhanger:** An identical maintenance signature appears in an equipment delivery log.

### E03 — Across the Line | Data movement, inference placement, and sovereignty

**Cold open:** The evacuation assistant works in the main region. When the primary path is cut, the automatic backup would send restricted requests outside the region approved in the city's fictional operating policy.

**Playable sequence:** Inspect three overlays showing storage, execution, and traffic path. Interview the policy owner to find out exactly which data classes and actions are restricted. Set a route and simulate losing its primary link. If the design has a hidden outside-region dependency, the mission shows which service would receive the request and blocks the activation. A scoped in-region recovery can serve one district while the team fixes coverage elsewhere.

**Equinix role:** In-region deployment and private connectivity. Introduce Fabric Geo Zones only for a supported geography and applicable Fabric design, as one network-layer control alongside application, storage, identity, and policy controls.  
**Buyer objection:** “The database is local. Haven't we already addressed residency?” A strong answer also asks where model inputs, inference, logs, and failover paths go.  
**Cliffhanger:** The backup routes of two independent operators converge on Voss's gateway.

### E04 — The Last Route | Distributed AI and the customer conversation

**Cold open:** The largest evacuation is approaching. Voss offers the city a fast restore through the gateway he controls. Elena will authorize the restart only if the team can show what happens when a dependency fails.

**Playable sequence:** Place the existing model endpoint, a secondary inference workload, a reference data source, and the dispatch application. Connect the chosen environments. Compare two credible designs against the city's current needs, then remove one path and inspect the resulting continuity. For the last scene, make a spoken or written recommendation to Elena using two facts from the incident. Reuse what the learner discovered earlier where their saved progress permits it. Supply a recap for direct entry.

**Equinix role:** Neutral colocation and interconnection across approved cloud, network, and AI partners. Illustrate proximity for the time-sensitive workload, subject to endpoint and network measurements. Keep some workloads in their current cloud.  
**Buyer objections:** “Why change anything now?” and “How does this lower risk without adding a new single point of failure?”  
**Resolution:** The chosen recovery path operates under a simulated outage. The last exterior shot shows the freight gates opening. Elena describes the business result and authorizes one next step with the technology team.

**Season extension after E04:** A separate generative AI mission can introduce retrieval, model output grounding, and permissioned tool use. Design a case where the player checks a cited source and approves a proposed action. Keep the first mission centered on inputs and inference so learners have a clean mental model.

## 4. Ghost Feed | Playable pilot script

**Format:** One mission with a short linear opening, a playable investigation, a branch in the field, a recovery simulation, and a customer conversation. Default viewpoint is an orbiting and target-focused camera, with optional keyboard pan. Runtime is a target, never a penalty. All narration and spoken dialogue have captions and transcript access.

| Approx. time | Scene and cues | Player action | What changes |
|---|---|---|---|
| 0:00–0:45 | Rain on the van glass. The dispatch screen paints the underpass green. Mara: “Dispatch says the tunnel is clear.” Worker over radio: “I'm looking at it. The tunnel's underwater.” The Pursuer's headlights turn into the same street. | Choose **Hold at the turnout**, **Continue toward the tunnel**, or **Ask for another observation**. An observation request places a provisional hold and asks the worker what they can see. | Holding gets the crew off the live route. Continuing triggers a last-moment stop and a replayable near miss. Both paths lead to investigation. |
| 0:45–1:15 | The truck in the windshield fills frame. The rain sound cuts. Its outline resolves into the Reconstruction camera plane. Imani: “This is the feed dispatch received. Look at it in order.” | Enter the reconstruction or skip the transition. Open the underpass camera. | Camera plane, time scrubber, and first evidence track become available. |
| 1:15–4:00 | Footage advances over three points. Same truck, spray, plate fragment, and flickering streetlight. Arrival times advance. Capture metadata repeats. | Compare three frames. Inspect the capture record. Pin the repeat as evidence. | The player can flag the camera feed as stale. Log the discrepancy without yet asserting who caused it. |
| 4:00–6:30 | Water-level partner has an independent live gauge. Imani: “We've got another view. Ask it what it can actually tell us.” The Pursuer reaches the turnout. Mara calls for a safe exit. | Compare the gauge and independent field report. Pick the verified operational feed and mark a safe surface route for the crew with field confirmation. | Mara exits the immediate danger using the confirmed route and local crew judgment. The automatic routing service remains degraded. |
| 6:30–7:30 | The Pursuer loses the van when Mara turns through a controlled freight gate. The crew reaches its designated continuity site. Camera passes through the exterior security line into an Equinix IBX operations area. | Enter recovery mode. View the approved backup workload, the existing cloud endpoint, and the partner feed. | The game switches from evidence gathering to infrastructure design. The venue is fictionalized. No real site layout or access procedure is depicted. |
| 7:30–11:00 | Imani: “The model is up. The old intake is isolated. Here's what we can connect.” The approved runbook exposes three candidate paths. | Choose a path, inspect why it qualifies, and simulate activation. Then show that a verified input changes the model's recommendation. | Slow or disallowed paths visibly fail their condition. The valid path restores service in the scenario. The routing change plays on the physical map. |
| 11:00–13:30 | Elena: “Why put the backup here if our cloud already runs the model?” | Deliver a 30–60 second written or spoken response. Compare with an evidence-linked debrief. | Show the evidence the learner used, the tradeoff they addressed, and one next discovery question. Offer a replay from the infrastructure choice. |
| 13:30–14:30 | Back on the street. The evacuation reaches the surface route. As the credits begin, Imani freezes one frame and points to the maintenance marker. | Review the field notes or leave the episode. | Unlock the next episode in a future build. Record completion and preserve the replay checkpoint. |

### Pilot dialogue and branch beats

Treat these as playable dialogue. The cold open runs for roughly 30 seconds before the first choice appears. Lines marked optional can be skipped by an experienced player. Include speaker names in captions and stage directions in the accessible transcript.

| Beat | Cue or dialogue | Interactive direction |
|---|---|---|
| GF01 • Street | A rain-soaked blue truck passes the van. Mara: “Underpass in one minute. Dispatch shows green.” Worker: “I've got water over the curb and rising. I can see it from the pump house.” Dispatch: “Tunnel clear. Proceed.” The Pursuer's three-beat tone breaks through the radio. | Leave the contradiction on screen when the choices appear. |
| GF02A • Hold | Mara: “At the turnout. Tell me when you've got eyes on the road.” Her brake lights catch the rain. | Record a precautionary hold. The crew has time to investigate. |
| GF02B • Continue | A bollard floats across the lane. Mara brakes. “That isn't where it's supposed to be. I'm pulling back.” | Show a short near miss, then place the van at the turnout. Record that Mara overrode the recommendation. |
| GF02C • Ask | Mara: “Holding. Can you give us a second reading?” Worker: “Look at gauge 14. It's on a different line from the camera.” | Hold the vehicle and add the worker's call to the evidence list. Other branches can discover the same call. |
| GF03 • Cross over | Imani: “Here's what dispatch received.” The truck's silhouette on the windshield becomes the outline of the truck in the Reconstruction. | Release camera control. Teach only how to select and scrub the feed. |
| GF04 • Compare | Optional hint, Imani: “You saw that spray pattern before.” Second hint: “Put the first frame next to the third.” Final hint: “The message arrived later. Did the camera capture anything new?” | Keep hints available by request. When the player marks stale footage, show the matching capture ID. |
| GF05 • Confirm | Worker: “The water's reached the first lane marker.” Imani: “Gauge 14 agrees. Different source. New reading.” Mara: “Give me a route the crew can confirm.” | Let the player compare the observations and authorize the surface road after the crew checks it. |
| GF06 • Pursuit | The Pursuer waits at the junction, following the route on the public dispatch screen. Mara takes the service road after local confirmation. The freight gate drops behind her. | The tactical outcome follows the player's source check. Update the objective from crew safety to service recovery. |
| GF07 • Enter IBX | The crew arrives at the continuity site. Elena: “We've got more vehicles coming. Where's the backup?” Imani: “The city's backup dispatcher is here. The model stayed in the cloud. We need a working path to the gauge.” | Let the player reveal the three nodes and the candidate connections before selecting a path. |
| GF08 • Test and react | On R01, the gauge appears late and Imani calls out the missed target. On R02, the runbook shows the blocked connection before any traffic appears. On R03 with verified input, Imani: “Gauge is live. Ask dispatch again.” Dispatch: “Underpass closed. Use the surface route.” | Keep manual dispatch on through each failed attempt. Show the old and new model inputs side by side on successful recovery. |
| GF09 • Brief | Elena: “Our cloud already runs the model. What are we paying for at the data center?” After the answer: “What would you ask our provider to prove before we change the design?” | Allow evidence pins from the investigation. Keep the second question in the debrief even when the first answer is skipped. |
| GF10 • Close | Vehicles pass the underpass safely on the surface road. Imani freezes a frame. “That marker belongs to the city's backup service. Why is it on the replay?” Cut to the same marker on an unmarked terminal as the Pursuer removes his helmet in silhouette. | Log completion. Offer **Replay recovery** and **Review evidence**. |

**Camera fixture:** Supply three identical frame captures at the same source instant, with a truck, a white spray fan, and a flickering lamp. Show different receipt times. Each card includes a source, capture time, and arrival time. The player may compare any pair, then open the capture record to cite the repeated sequence. In the 2D path, show the same frames and records.

### Pilot truth sheet

The model is a pre-existing, simplified routing inference service. It scores available routes using hazard inputs. The pilot represents it with a deterministic teaching fixture. The repeat is on the **camera relay**, where an unauthorized loop was presented as live. A score or confidence indicator can be high given those inputs. The model host is healthy. Compute can speed up a response to stale inputs without correcting the source. An independent water-level gauge and a field report corroborate the hazard. The gauge comes from an approved partner. The crew's hold and exit require human confirmation, even after routing is restored.

| Evidence ID | Player-facing evidence | Authoritative fact |
|---|---|---|
| E01_CAMERA | Three clips arriving at 02:13:08, 02:13:20, 02:13:32. | They reuse capture sequence 8041 and the same source timestamp. |
| E02_FIELD | Worker report, with observed location and time. | A separate human observer reports water at the underpass. |
| E03_GAUGE | Partner gauge with measurement and source timestamp. | Latest reading is 0.76 m at 02:13:34. Scenario closure threshold is 0.30 m. |
| E04_MODEL | Dispatch inference record. | Underpass was suggested using the stale feed. The endpoint remains available. |
| E05_RUNBOOK | Approved continuity workload and provisioned paths. | Backup runs in the IBX tenant environment. Cloud model stays with its existing provider. Partner endpoint must be approved and reachable. |
| E06_MARKER | Relay overlay with a maintenance trace. | The trace foreshadows the antagonist. It has no bearing on the infrastructure score. |

**Correct causal chain:** Verify evidence → stop relying on the stale relay → confirm the crew's physical route → select the approved private path to the partner → use the verified feed in the backup dispatch workload → call the existing inference endpoint → show the underpass closed. Private connectivity supplies an approved path. Source verification and authorization are distinct checks.

**Playable product reveal:** Let the player click the physical workload rack, partner connection, and cloud link. Each interaction lights the corresponding node in the schematic. A single descriptive sentence explains what that item does. Use an approved Equinix nameplate only when brand assets are available.

## 5. Ghost Feed | Rules, paths, and learning feedback

### Recovery fixture

These are invented scenario values, including timing, geography, provisioning, and cost. Never label them benchmarks or product commitments. The measured quantity in the exercise is **end-to-end p95 dispatch response time**, across all application dependencies, under the scenario's test load. All options assume a healthy existing model endpoint. Candidate connections already exist in the city runbook.

| Path ID | Candidate configuration | Simulated p95 | Network policy | Outcome |
|---|---|---:|---|---|
| R01 | Existing approved gateway to the verified partner | 410 ms | Approved path | Source is valid. Response misses the city's 250 ms target during incident load. Manual dispatch remains active. |
| R02 | Direct connection using an unapproved public endpoint | 185 ms | Disallowed for this feed | Policy blocks activation before any request is sent. Show which approval is missing. |
| R03 | Provisioned Fabric connection to the approved sensor partner from the IBX backup environment. Existing private connection to the cloud model remains in place. | 205 ms | Approved path | With the gauge verified, the runbook permits activation. The model recommends the surface route. |

Use response distributions or seeded samples only if the chart genuinely helps. A first build needs just the displayed p95 and the independent source, policy, and latency gates. Allow inspection of plausible cloud-native alternatives in the debrief. Explain that an approved existing cloud connection meeting these same requirements could work.

**Causal outcome rules**

- The worker's report is sufficient for a precautionary hold. A hold is available even while the player is comparing feeds.
- Reveal E01 only after inspecting two relevant frames or choosing the accessible evidence-list equivalent. Flagging the feed requires E01. Show “capture time” and “arrival time” as separate labels.
- The verified feed becomes available after comparing E02 and E03. The capture sequence is evidence of replay or staleness. Identification of the adversary requires separate evidence.
- The route selected by the player drives the outcome. Evaluate source provenance/freshness, path authorization, and response target independently. Display all three with an explanation. A failed condition preserves the last safe state.
- In recovery, offer **Verified partner gauge** and **Quarantined relay** as inputs to the offline route simulation. Default to an explicit source selection. R02 must stop before simulating a request. R01 can return a late result. R03 with the quarantined relay fails the source gate. A route only activates after all three gates pass. Clicking the Equinix name or rack does not validate a design.
- A recovery attempt must be logged once per committed action. Allow a new attempt after changes. An explicit replay restores the selected checkpoint and creates a new attempt record. Scrubbing footage or opening a note is reversible and should not accumulate false attempts.
- Every route has an authored consequence and a next action. Never trap a learner in a dead end. A qualified recovery is required to finish the pilot. Incorrect options are deliberate practice.

### Customer conversation and debrief

Elena asks: “Our cloud already runs the model. What are we paying for at the data center?” Her follow-ups address the player's response.

| If the player says… | Elena's follow-up |
|---|---|
| “It gives us better AI.” | “Did we change the model? Which part of the system actually changed?” |
| “Fabric made the feed trustworthy.” | “How did we verify the feed itself?” |
| “We need a private connection.” | “What must it connect, and what requirement does the existing path miss?” |
| “I would keep everything in our cloud.” | “That could work. What would you measure or verify before committing?” |

**Example learner response:** “Keep the model where it runs today. Our issue was getting the verified partner feed to the backup application over an approved path within our response target. The IBX environment gives us a place to run that backup, and the provisioned Fabric connection gets us to the partner. If the current cloud path meets those same requirements, we should compare it before changing the design.”

Give feedback against four observable behaviors. Each is **demonstrated**, **partial**, or **needs evidence**:

1. Separates model behavior from data quality and cites the repeated capture or another valid clue.
2. Explains the workload placement and connection with the correct direction and purpose.
3. Connects the decision to a requirement such as freshness, approved routing, or response time.
4. Acknowledges a viable alternative or asks a relevant discovery question.

Use a deterministic local debrief in the pilot. Compare selected evidence and the route choice with an authored example. Let the learner write or speak their answer for reflection. Provide self-assessment against the four criteria. A keyword match is insufficient for scoring a free-form answer. When an approved model is added, require a quote from the learner's answer and an evidence ID per claim of demonstrated skill. Treat model feedback as formative. Retain an explicit text option for speech. Add human calibration before using any generated feedback for certification or formal assessment.

**Learning transfer:** End the debrief with a different situation. A catalog assistant works but responses slow down after a new supplier database is added. Ask the learner which evidence they would request first. Reveal how response traces can distinguish retrieval, network, and model time. Score the diagnostic rationale in a pilot study with a reviewer rubric. Track completion and voluntary replay as engagement signals, not proof of skill.

## 6. What to build and where

| Layer | Recommendation | Decision and rationale |
|---|---|---|
| Source and development | Dedicated private Git repository named `signal-run`. Claude Code in a local editor or approved development environment. | This is a game with versioned narrative, media, state transitions, graphics, tests, and deployment config. Give the content and the code separate folders in the same repo. |
| Browser app | TypeScript, Vite, React for UI and accessible controls, vanilla Three.js for rendering. | One scene controller owns the canvas. React owns episode navigation, dialogue, evidence, captions, and decisions. No separate game engine is needed for the pilot. |
| Art and audio | Blender → GLB for geometry; encoded videos or motion panels for physical scenes; pre-rendered dialogue, subtitles, and audio stems. | 3D effort goes to the interactive reconstruction. Reuse sets, rigging, LUTs, and sound motifs across episodes. Placeholder scene assets should be easy to replace. |
| Pilot delivery | Local development first. For an authorized synthetic-data preview, use **Cloudflare Workers Static Assets** with the Vite plugin when the Worker is needed. An existing approved Cloudflare Pages setup can serve the first static build. | Start with a browser build that runs without backend services. Use a Worker when ready for authenticated routes or private media. The pilot can work from static assets and local progress. |
| Production delivery | Use an Equinix-approved internal hosting and identity configuration. If Cloudflare is approved for the intended cohort, use a private custom host, corporate Entra ID via Access, and protected media delivery. | Validate group policies, licenses and audience size with IT before adopting the path. If approval or licensing rules out Cloudflare, use the approved internal origin/CDN with corporate SSO. The app stays portable. |
| Larger media | Versioned private object storage. R2 is an option on an approved Cloudflare deployment. Serve through the authenticated origin or an approved private delivery flow. | Workers Static Assets currently documents a 25 MiB per-file cap. Split media by scene. Support range requests for large video when required, and test seeking plus content type and cache handling. |
| AI at runtime | Optional server-side route to an approved enterprise model, after the deterministic pilot works. | AI can play Elena or offer hints. Claude Code is the development tool. The app's optional model provider is a separate decision. Preserve offline authored fallback. |

**Repository contract**

```text
signal-run/
  CLAUDE.md                  # short engineering and content guardrails
  README.md                  # setup, build, test, and local preview
  docs/
    Signal_Run_Series_Blueprint_for_Claude_Code.md
    implementation-status.md
    asset-ledger.md
  src/
    app/                     # routing, episode shell, settings
    content/
      schema.ts
      episodes/ghost-feed.ts
    simulation/
      state.ts
      transition.ts
      evaluate-recovery.ts
      debrief.ts
    scenes/
      reconstruction/
      scene-controller.ts
      quality.ts
    presentation/            # scene panels, captions, evidence and route UI
    platform/                # save store, audio, optional AI interface
  public/
    episodes/ghost-feed/     # immutable encoded assets and manifests
  tests/
    unit/
    e2e/
  worker/                    # optional. Introduce when authenticated APIs are needed.
```

Suggested routes are `/` for the series landing, `/episodes/ghost-feed` for play, and `/episodes/ghost-feed/debrief` if a stable debrief link is useful. Route changes must respect save state. Use Vite's development server and the pinned dependencies from the lockfile. Expected commands: `npm ci`, `npm run dev`, `npm run typecheck`, `npm run test`, `npm run test:e2e`, and `npm run build`.

### Deployment sequence

1. **Run locally.** Build and test with synthetic scenario content and generated or authorized placeholders. Commit the lockfile and asset ledger. Verify that a production build serves the pilot and refreshes a deep link correctly on the preview host.
2. **Prepare private staging.** Map an approved hostname and configure SSO for a pilot group. Restrict or disable alternate provider hostnames and previews that could expose the same content. Test authenticated requests and signed-out requests to the app, media, and any APIs as separate paths.
3. **Add media and APIs as needed.** For Workers Static Assets, point the final generated Worker configuration at the build output and use `single-page-application` routing. When an API is introduced, configure Worker-first routing for `/api/*` (and protected media paths if applicable). Test the config against the pinned Cloudflare Vite plugin rather than assuming its output paths. If authentication is handled by the Worker, it must protect every relevant static path too, or the entire host must sit behind the access control layer.
4. **Release to the approved cohort.** Keep separate staging and production destinations. Build from a tagged commit, record the content and asset versions, and retain a known-good release for rollback. Confirm the approved identity group before expanding.

## 7. Application and simulation architecture

### Separation of responsibilities

- **Episode definition:** versioned data for scenes, evidence, dialogue, gates, choices, routes, outcomes, and asset references. It can initially be a typed TypeScript module. Validate unique IDs and cross-references at load or build time.
- **Simulation:** pure transition and outcome functions. Shared by all player modes. Timestamps and route values come from episode fixtures. Inject any clock or seed needed for testability.
- **Presentation:** react to state and emit domain actions. The render loop may interpolate position, particles, or camera movement. It must not make story, scoring, or persistence decisions.
- **Timeline:** metadata drives time-based cues. If audio or video fails, show its fallback panel and transcript. When skipping a cutscene, dispatch the same completion event as natural playback exactly once.
- **Storage:** local device progress and settings for the pilot. Optional API or LMS integrations can be evaluated for the rollout.

```ts
type Phase = 'coldOpen' | 'investigation' | 'fieldExit'
  | 'recovery' | 'briefing' | 'complete';

type RouteId = 'R01' | 'R02' | 'R03';

interface EpisodeState {
  version: 1;
  phase: Phase;
  fieldStatus: 'moving' | 'held' | 'safe';
  viewedEvidence: string[];
  citedEvidence: string[];
  flaggedStaleFeed: boolean;
  verifiedSource: boolean;
  selectedSource: 'verifiedGauge' | 'quarantinedRelay' | null;
  selectedRoute: RouteId | null;
  recoveryStatus: 'degraded' | 'restored';
  checkpoint: string | null;
  attempts: AttemptSummary[];
}

interface AttemptSummary {
  route: RouteId;
  source: NonNullable<EpisodeState['selectedSource']>;
  sourcePass: boolean;
  policyPass: boolean;
  responseTimePass: boolean;
  outcome: 'held' | 'restored';
}
```

Use discriminated actions such as `chooseFieldAction`, `inspectEvidence`, `flagStaleFeed`, `verifySource`, `selectSource`, `selectRoute`, `simulateRecovery`, and `replayCheckpoint`. Validate actions by phase and evidence prerequisites. Include reason codes in outcomes. Use the same IDs in visuals, captions, tests, and telemetry. Keep camera and transient display state out of the saved simulation. Save only at meaningful transitions, handle unavailable or full storage, and provide a way to start over. Validate saved schema versions. A corrupted or incompatible save should offer a clean restart without leaving the app blank. Avoid storing free-form reflection text in analytics.

### Optional AI and team play

**AI characters:** A server request carries episode ID, current phase, learner-visible evidence IDs, and a short question. Resolve permitted facts on the server. Ask the model for a bounded response such as `{line, evidenceIds, followUpId}`. Validate evidence and follow-up against the phase. If it times out, fabricates an ID, or returns an invalid payload, use the authored line. No runtime model may advance phases, disclose hidden evidence, grant network policy approval, or decide whether recovery succeeded. In production, apply identity, request limits, model approval, and retention rules at the server boundary. Treat all pilot text as fictional.

**Team mode after the pilot:** Begin with one shared screen and three role briefs, led by a facilitator. Field Lead gets the physical observations, Analyst gets model input records, and Architect gets the topology. The team must share two observations before activating a route. Consider synchronized browser sessions only if facilitated play proves useful. Use one authoritative room state, snapshot on reconnect, and assign a decision owner. Keep solo mode complete.

## 8. Graphics and audio direction

### Renderer choice

**Ship WebGL2 as the baseline.** Use `WebGLRenderer`, physically based materials for the IBX scene, and custom materials only for a defined story effect. Use WebGL-compatible post-processing such as `EffectComposer`, optional selective bloom, anti-aliasing chosen for the target tier, and one output/tone-mapping stage. Keep UI text in the DOM so it stays readable and keyboard accessible.

**Trial WebGPU as a separate enhancement.** Use a dev flag and a renderer adapter. Three.js documents that `WebGPURenderer` can fall back to a WebGL2 backend and can be forced to use that backend for tests. That adapter is a different pipeline from the shipping WebGL renderer. Prototype its own TSL materials and post-processing. Do not assume WebGL shader or composer compatibility. Gate its release on device tests, scene parity, and a measurable gain. If graphics initialization fails entirely, switch to the 2D evidence and routing view.

### Shot and scene notes

| Beat | Implementation direction | Equivalent on lower settings |
|---|---|---|
| Cold open | Use layered cel-shaded plates with parallax, a moving wiper silhouette, rain reflections, and pre-rendered character closeups. The truck and sensor camera each have a recognizable silhouette. | Static painted frames, timed cuts, captions, and the same decisions. |
| World transition | Match-cut the physical windshield to the reconstruction's camera plane. A depth-mask or shader dissolve can reveal visible mesh edges. Keep the transition brief and skippable. | A direct cut with the same framing and a label. |
| Reconstruction | A compact 3D slice of the city around the underpass. Use orthographic or mild perspective camera, constrained orbit and point-of-interest framing. Labeled data panels attach to landmarks. | Clickable 2D schematic and the same evidence panels. |
| Truck loop | Render a single authored truck motion track into a camera plane or use a pre-rendered identical clip. Advance the arrival label separately. Pause and scrub deterministically. | Three stills with equivalent capture and arrival metadata. |
| Physical reveal | Dark exterior with emergency lights, then an authored camera move through a fictionalized operations corridor to a row of racks. Use glTF geometry, baked lighting, roughness response, and subtle depth. | Still plates plus the rack/partner/cloud topology. |
| Link activation | Animate traffic direction along selected paths, then update live/gap markers and the model input indicator. Use line weight, dashes, and icons as well as color. | No motion required. Updated state and labeled connection paths carry the meaning. |
| Final street scene | Repeat the dispatch map from the opening. The surface route becomes available and the van turns. This is the visible consequence of the restored service. | Static before/after plates, same route text and final dialogue. |

### Graphics and asset pipeline

- Author at a consistent scale in Blender. Apply transforms, bake or pack appropriate lighting, use material IDs deliberately, and export glTF/GLB with versioned output filenames. Validate each scene in the actual renderer. Use an asset manifest with required versus optional assets, estimated bytes, fallback, captions, and rights status.
- Use glTF via `GLTFLoader`. Use KTX2/Basis Universal textures with `KTX2Loader` and the transcoder configured for the renderer. Consider Meshopt or Draco for tested geometry savings, and measure decode impact. Reserve higher-resolution textures for the underpass camera evidence and close shots. Smaller atlas or tiling materials are sufficient for distant scenery.
- Instance repeated city props, rack modules, lane lights, and rain or traffic markers where beneficial. Bake ambient detail into textures or light maps. Use a small number of key lights and a shared environment where it materially improves the scene. Cull off-screen and out-of-range elements. Check whether merging static props hurts culling or picking.
- Prefer shader or instanced particle effects for stylized rain and data streams. Keep screen-space reflections, volumetrics, real-time global illumination, and multiple dynamic shadow casters out of the baseline. Prototype a local effect only where it makes a story beat clearer.
- Run one animation loop. Cap pixel ratio by quality tier. Dispose of geometries, textures, render targets, listeners, and audio on scene exit. Pause when hidden and respond to context loss with a 2D fallback and a resume affordance. Prevent double initialization on mount, route changes, and development hot reload.
- Use Web Audio or regular media controls according to the need. Unlock playback from a user gesture. Keep dialogue, ambience, and score as distinct stems where practical. Offer captions, mute, and dialogue level. Preserve silence at the world transition and use a brief audio cue to distinguish stale and live evidence without making audio the only clue.
- Generate concept art and temporary media with approved tools and keep provenance in the asset ledger. Use original voices or authorized talent. Preserve a master for each clip and encode web derivatives. Ship an initial browser-compatible format and test decoding before adding alternatives.

### Starting performance targets

These are engineering targets for the pilot. Revise after measuring on managed hardware.

| Metric | Target and test |
|---|---|
| Initial UI | Interactive pilot shell within 3 seconds in a controlled preview test with a cold cache and 10 Mbps downstream. Record network, CPU, and device profile. |
| First-play payload | Aim for ≤ 1.5 MB compressed before controls can respond. Stream the first optional motion asset and prepare the reconstruction while the opening is playing. Aim for ≤ 12 MB transferred to reach the first 3D interaction at default quality. |
| Frame budget | Target 60 fps on a representative integrated-GPU sales laptop, with a 30 fps low setting. Profile a full investigation and recovery on actual target hardware. Desktop CI with software rendering checks correctness only. |
| Scene complexity | Starting review thresholds of 120 draw calls and 300k visible triangles on standard. Keep DPR around 1.25 standard and 1.0 low unless measurement supports a change. Monitor GPU memory and allocations during checkpoint replay. |
| Responsive and reduced motion | Usable at 360 CSS px and on typical work laptop displays. Support keyboard, touch, captions, high contrast, and reduced motion. Zero required precision aiming or time pressure. |
| Fallback | Full episode progression with 3D disabled, reduced motion on, and audio muted. Missing optional assets must never block a required clue. |

**Budget policy:** Measure the worst moments, especially the reveal and link animation. Reduce resolution scale and optional post effects before reducing the clarity of clues. Prioritize readable text and predictable input. Treat a browser capability check as a starting point, then detect renderer init failure and repeated frame-budget problems at runtime. Provide manual quality selection.


## 9. Interface and interaction specification

### Screen states

| Screen | Primary view | Visible controls and information | Exit condition |
|---|---|---|---|
| Series landing | Full-bleed painted frame of the van approaching the underpass. Title and one sentence of context. | **Play Ghost Feed** or **Resume Ghost Feed**. Settings, captions, reduced motion, and graphics mode. Other episodes are identified as coming later. | Start or resume. |
| Field sequence | Cinematic framing with dialogue near the lower safe area. | Large action choices when Mara asks for a decision. Pause, captions, skip, and transcript remain reachable. No simulated time elapses while reading a choice. | Field choice and transition. |
| Reconstruction | 3D district on the left or behind the interface. Evidence and route controls in the DOM. Desktop can use a side panel. On mobile, place controls beneath the scene. | Current objective, **Focus camera**, scrub control and previous/next frame, **Open capture record**, **Pin evidence**. A list duplicates every required 3D target. | Stale feed flagged and independent source verified. |
| Field exit | Scene at the turnout. The two observations are visible with source labels. | Confirm hold and authorize the observed surface route after corroboration. If the initial decision was to continue, show the consequence before allowing a revised route. | Crew is safe. |
| Recovery | IBX scene paired with the application topology. Selectable links between the city application, data partner, and existing model provider. | Source selector, three candidate paths, current runbook conditions, **Test route**, last outcome, and replay from checkpoint. | Successful recovery result. |
| Briefing | Elena on an incident call. Selected evidence remains within reach. | Text answer field, optional speaking mode in a later build, **Review my response**, and **Continue**. Show the deterministic feedback and authored example. | Debrief shown and completion confirmed. |

Use semantic buttons and a native range input for the scrubber. Keyboard users must be able to reach each clue in a logical order. Confirm major state transitions with short text and a polite live region. On scene change, move focus to its heading. Supply a pause action for motion panels and any future timed gameplay. In the 2D path, preserve the same clue order and state transitions.

### Interaction copy samples

- **Initial objective:** “Resolve the conflicting tunnel reports.”
- **After camera comparison:** “Capture sequence 8041 repeats. Check an independent source.”
- **Manual dispatch:** “The crew is safe. Automatic routing is still offline.”
- **R01 result:** “The feed is verified and the path is approved. The response missed the city's target. Keep manual dispatch active.”
- **R02 result:** “Activation blocked. This endpoint is outside the city's approved paths for this feed.”
- **R03 result:** “The partner feed is verified. The approved path meets the response target. The underpass is closed in dispatch.”
- **Replay:** “Try another path from the same incident state.”

Each message should explain the direct consequence and point to the next available action. Write dialogue in the voices defined in Section 2. Introduce a technical term in a short mission note the first time it applies.

## 10. Implementation order and release gates

| Milestone | Build scope | Gate before proceeding |
|---|---|---|
| M0 — Setup | Vite and TypeScript app, content schema, first episode route, test commands, README, lockfile. Add the repo's CLAUDE.md. | Production build and local preview start. Episode loads as a route. No credentials required. |
| M1 — Playable greybox | Full episode with timed panels, 2D evidence, deterministic branches, route evaluation, debrief, replay, and local persistence. Use geometric placeholders and plain captions. | Test every route, both early consequences, recovery from an incorrect choice, and keyboard-only completion. A learner can explain the truck clue and the restored path. |
| M2 — Three.js vertical slice | Add the underpass reconstruction, camera plane, repeated truck motion, and topology links. Integrate graphics with the same simulation. Include low quality and 2D fallback. | Real WebGL browser can enter, inspect, scrub, and exit. Disable WebGL and complete the same episode. Run multiple replays and check for duplicate loops or sustained memory growth. |
| M3 — Cinematic pass | Add original art, cast dialogue, captions, intro transition, controlled physical chase, IBX sequence, and outro. Use incremental media loading. | Compare with the targets in Section 8. A person who has never played gets to the first consequential action within one minute. Cutscene skipping and asset failure preserve progress. |
| M4 — Pilot release | Deploy to an authorized preview environment. Run content, product, brand, accessibility, browser, and identity checks. Observe a small sales cohort. | Every supported entry point and identity path works. Review field notes, debrief performance, and observed confusion before commissioning the remaining episodes. |
| M5 — Expansion | Build Episodes 2–4 against the same schema, add optional AI dialogue and test WebGPU separately. Consider facilitated team mode and LMS handoff. | Each episode ships with a tested decision model, accessibility parity, and verified sales claims. The complete season can be played in sequence or entered at an episode with its recap. |

### Acceptance checks for the first playable build

- **Narrative:** The field conflict is clear within 45 seconds. The first choice changes Mara's next physical action. The antagonist appears in the story and leaves one season clue. The ending shows a visible outcome from the recovery.
- **Evidence:** The same capture is reproducible during scrub and replay. New arrivals never make an old capture appear live in the evidence panel. The player can inspect the independent report and gauge in any permitted order.
- **Causality:** R01 misses the target, R02 is blocked, and R03 restores only after the verified-source requirement is met. Verify that the same input action yields the same result on desktop, mobile, and fallback. A route test leaves a safe state intact. Test R03 with the quarantined relay and confirm that it cannot activate.
- **Save and replay:** Reload from investigation, recovery, and briefing. Replay twice, pick different routes, and confirm that previous choices do not leak across the reset. Gracefully handle corrupt and older progress data.
- **Access and browser:** Use automated Chromium for repeatable journeys and test on representative managed Edge or Chrome. Test Safari for supported desktop and mobile use. Cover reduced motion, mute, 2D fallback, keyboard-only play, 360 px layout, and graphics initialization failure. On protected staging, confirm app, media, and API behavior with and without an authenticated session.
- **Learning:** Ask pilot learners to tell you what actually changed in the architecture and what would have made their existing cloud path viable. Use the transfer case in Section 5 to check whether they can apply the reasoning to a new customer. Use a reviewer to examine responses before interpreting engagement or completion data.
- **Sales accuracy:** Product reviewers check each mention of Equinix against the actual capability and scope. Reviewers verify that the separation between the customer's app, partner, model provider, and Equinix survives any copy or diagram change.

### Pilot evidence to collect

Record supported browser and device, episode and content version, phase reached, elapsed play time excluding pauses where possible, choices selected, number of hints, and replay behavior. If collecting analytics is approved, use pseudonymous session IDs and content IDs. Keep the pilot operable without analytics. Use observations and the transfer task to determine whether to invest next in art, narrative, usability, or more scenarios.

## 11. Production handoff and references

### Asset and writing handoff

| Deliverable | Suggested format | First release |
|---|---|---|
| Episode script | Scene IDs, speaker, line, optional gesture, captions, branch, outcome | All pilot lines and choices. Character voice and stakes are part of acceptance. |
| Concept art and boards | Original plates and six storyboard frames from opening to final street shot | Van interior, underpass, camera plane, turnout, IBX corridor, and surface route. |
| 3D assets | `.blend` source and optimized GLBs, with scene origins and camera targets | Underpass slice, recognizable truck, sensor props, stylized rack row. |
| Audio and caption package | Source WAV, optimized web derivatives, WebVTT, transcript | Opening, world transition, field confirmation, IBX dialogue, final reveal. |
| Product and brand review | Versioned claim list and current asset approvals | At minimum IBX, Fabric, cloud role, and recovery schematic. |
| Pilot operations | Run-of-show, scenario report, device test notes, and a tagged release | Facilitator can explain the premise, collect transfer responses, and reset the episode. |

For each episode, keep four paired artifacts in its content folder or documentation: a scene script, the truth sheet, a decision matrix with outcomes, and a claims list. Keep approved claims traceable to a source and the exact screen or line that uses them. Art, dialogue, and score can iterate independently of the gameplay rules.

### Primary references

Product capabilities and hosting limits can change. Recheck these sources at implementation and before publication. Fictional incident metrics in this blueprint are authored values.

- Creative reference: [Escape to Questworld, The Real Adventures of Jonny Quest](https://tv.apple.com/us/episode/escape-to-questworld/umc.cmc.1m8kctjsbf98pjrauknns17py).
- AI basics: [Google Machine Learning Crash Course](https://developers.google.com/machine-learning/crash-course).
- Equinix role: [Distributed AI solutions](https://www.equinix.com/product-solutions/ai), [Equinix Fabric documentation](https://docs.equinix.com/fabric/), [AI-ready data center design](https://www.equinix.com/resources/solution-briefs/ai-ready-data-center-solution-design), [3verest customer case](https://www.equinix.com/insights/case-studies/3verest). Use real cases for optional debrief context and preserve their scope.
- Three.js: [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html), [EffectComposer](https://threejs.org/docs/pages/EffectComposer.html), [WebGPURenderer and fallback](https://threejs.org/docs/pages/WebGPURenderer.html), [Three.js Shading Language](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language), [GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html), [KTX2Loader](https://threejs.org/docs/pages/KTX2Loader.html), [InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html).
- Cloudflare: [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/), [SPA routing](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/), [Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/), [limits](https://developers.cloudflare.com/workers/platform/limits/), [R2](https://developers.cloudflare.com/r2/), [self-hosted Access applications](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/), [Entra ID integration](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/entra-id/).
- Claude Code: [project memory and CLAUDE.md](https://code.claude.com/docs/en/memory). Put stable, concise repository instructions in CLAUDE.md. Keep this specification in the docs directory.

## 12. Paste into Claude Code

Use this as the first instruction after placing the blueprint in the repository. Approve deployment separately through the team's normal release process.

```text
Read docs/Signal_Run_Series_Blueprint_for_Claude_Code.md end to end.
This document defines the narrative, gameplay, learning outcomes, visual
direction, architecture, and first release for Signal Run.

Inspect this repository and respect its existing conventions. If it is
empty, scaffold a Vite, TypeScript, React, and Three.js project. Use WebGL2
as the first renderer. Select compatible stable versions, pin them in
the lockfile, and verify relevant APIs against the official docs. Create
a short CLAUDE.md that points to the blueprint and records the essential
engineering guardrails. Do not duplicate the specification.

Build M0, then M1, then the first working WebGL2 slice of M2. Start with
a small asset-free build and original placeholder scenes. The first
working result must let me complete Ghost Feed end to end locally.
Implement the opening decision, three repeated captures, two independent
observations, the field exit, the two input sources, all three recovery paths,
and the customer debrief. Add the 3D underpass, animated truck loop, and selectable route
view on top of the same simulation. Leave the full 2D path usable.

Keep the simulation pure and deterministic. Match the evidence IDs,
route outcomes, gates, and story consequences in Sections 4 and 5. The
renderer and timeline can display the consequences of a committed
action but cannot decide them. Keep the state and authored narrative
separate. Preserve a replay checkpoint and write meaningful tests for
the route outcomes, save and restore, and complete pilot journeys.
Use synthetic data, authored dialogue, and local storage at this stage.
No model API, real site assets, customer records, or publishing is needed.

Work through the milestones and report actual verification results.
Run typecheck, unit tests, browser journeys, and production build. Test
the 2D path with WebGL unavailable. Save observed gaps and the remaining
cinematic work in docs/implementation-status.md. Give me the exact
local preview command and identify the parts that are placeholders.
```

**First review:** Play Ghost Feed without reading the lesson notes first. At the moment the truck repeats, the player should be able to infer the problem and do something about it. After the final scene, ask them what the Equinix site and Fabric connection each contributed. Those two moments are the first creative and learning acceptance checks.
