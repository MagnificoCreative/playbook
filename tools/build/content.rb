# A quiet divider: the ground line, and a root system growing down into "Where trust is lost".
# Roots are grown procedurally (seeded, so the drawing is stable): each root bends a little,
# splits into thinner, fainter roots, and tapers off toward the edges.
ROOT_PATHS = begin
  seed = 23
  rnd = -> { seed = (seed * 16807) % 2147483647; (seed - 1) / 2147483646.0 }
  out = []
  grow = lambda do |x, y, ang, len, depth, at|
    steps = depth.zero? ? 4 : 2 + (rnd.() * 2).round
    d = "M#{x.round(1)} #{y.round(1)}"
    cx, cy, a = x, y, ang
    pts = []
    steps.times do
      a += (rnd.() - 0.5) * (depth.zero? ? 0.28 : 0.6)
      a = [[a, 0.25].max, Math::PI - 0.25].min           # always heading down
      seg = len / steps
      nx, ny = cx + Math.cos(a) * seg, cy + Math.sin(a) * seg
      mx, my = cx + Math.cos(a + (rnd.() - 0.5) * 0.9) * seg * 0.55, cy + Math.sin(a + (rnd.() - 0.5) * 0.9) * seg * 0.55
      d << " Q#{mx.round(1)} #{my.round(1)} #{nx.round(1)} #{ny.round(1)}"
      pts << [nx, ny, a]
      cx, cy = nx, ny
    end
    op = [0.55, 0.36, 0.24, 0.15][depth]
    w = [1.4, 1.1, 0.9, 0.75][depth]
    out << %(<path class="root" data-at="#{at.round(3)}" d="#{d}" stroke-opacity="#{op}" stroke-width="#{w}"/>)
    return if depth >= 3
    pts[0..-2].each_with_index do |(px, py, pa), i|
      n = depth.zero? ? 2 : (rnd.() < 0.7 ? 1 : 2)
      n.times do |k|
        side = (k.zero? ? (rnd.() < 0.5 ? -1 : 1) : -1 * (rnd.() < 0.5 ? -1 : 1))
        na = pa + side * (0.55 + rnd.() * 0.6)
        grow.(px, py, na, len * (0.38 + rnd.() * 0.22), depth + 1, at + (i + 1).to_f / steps * (0.5 / (depth + 1)) + 0.04 * depth)
      end
    end
  end
  grow.(500, 20, Math::PI / 2, 236, 0, 0)
  out
end
ROOTS = <<~HTML
  <div class="roots" id="roots" aria-hidden="true">
    <svg viewBox="0 0 1000 304">
      <defs><linearGradient id="ground" gradientUnits="userSpaceOnUse" x1="80" y1="0" x2="920" y2="0"><stop offset="0" stop-color="#002a32" stop-opacity="0"/><stop offset=".5" stop-color="#002a32" stop-opacity=".4"/><stop offset="1" stop-color="#002a32" stop-opacity="0"/></linearGradient></defs>
      <path d="M80 20H920" stroke="url(#ground)" stroke-width="1" fill="none"/>
      #{ROOT_PATHS.join("\n      ")}
      <circle class="root-tip" cx="500" cy="20" r="4"/>
    </svg>
  </div>
HTML

# ───────────────────────── 00 · Introduction ─────────────────────────
# Where trust is lost: copy beside a vertical chart (it doesn't use block(), whose chart sits below the copy)
trust_section = <<~'HTML'
<section class="sec" id="where-trust-is-lost" data-section="where-trust-is-lost" aria-labelledby="t-where-trust-is-lost">
  <div class="panel block">
    <div class="trust-split">
      <div class="block-intro" data-reveal>
        <h2 class="h2" id="t-where-trust-is-lost">Where trust is lost</h2>
        <p>Operational information loses trust on its way from source to decision. It’s born in sensors, records and systems. It’s exported and reshaped in spreadsheets. It’s reconciled by hand before meetings. It’s presented in dashboards built by different teams. By the time it reaches a decision, nobody is sure which version to believe.</p>
      </div>
<div class="stage viz trust-viz" id="flow">
  <svg viewBox="0 0 560 490" role="img" aria-label="Trust steps down as operational information moves from Source to Prepare, Reconcile, Present and Act.">
    <line class="hl" x1="0" y1="40" x2="540" y2="40" stroke-opacity=".3"/>
    <text class="axis" x="540" y="24" text-anchor="end">Trust</text>
    <text class="axis axis-dim" text-anchor="end" transform="translate(556 56) rotate(-90)">High</text>
    <text class="axis axis-dim" text-anchor="start" transform="translate(556 480) rotate(-90)">Low</text>
    <g class="flow-rows">
      <line class="hl" x1="0" y1="128" x2="540" y2="128" stroke-opacity=".06"/>
      <line class="hl" x1="0" y1="216" x2="540" y2="216" stroke-opacity=".06"/>
      <line class="hl" x1="0" y1="304" x2="540" y2="304" stroke-opacity=".06"/>
      <line class="hl" x1="0" y1="392" x2="540" y2="392" stroke-opacity=".06"/>
      <line class="hl" x1="0" y1="480" x2="540" y2="480" stroke-opacity=".06"/>
    </g>
    <g class="flow-guides">
      <line class="hl" x1="515.8" y1="40" x2="515.8" y2="480" stroke-opacity=".14" stroke-dasharray="3 5"/>
      <line class="hl" x1="458.9" y1="40" x2="458.9" y2="480" stroke-opacity=".14" stroke-dasharray="3 5"/>
      <line class="hl" x1="402.1" y1="40" x2="402.1" y2="480" stroke-opacity=".14" stroke-dasharray="3 5"/>
      <line class="hl" x1="345.3" y1="40" x2="345.3" y2="480" stroke-opacity=".14" stroke-dasharray="3 5"/>
      <line class="hl" x1="288.4" y1="40" x2="288.4" y2="480" stroke-opacity=".14" stroke-dasharray="3 5"/>
    </g>
    <path class="ln" id="flow-line" stroke-opacity=".6" d=""/>
    <g class="flow-labels">
      <text class="lbl" x="0" y="78">Source</text><text class="lbl-s flow-sub" x="0" y="102">Sensors, records, systems</text>
      <text class="lbl" x="0" y="166">Prepare</text><text class="lbl-s flow-sub" x="0" y="190">Exported to spreadsheets</text>
      <text class="lbl" x="0" y="254">Reconcile</text><text class="lbl-s flow-sub" x="0" y="278">By hand, before meetings</text>
      <text class="lbl" x="0" y="342">Present</text><text class="lbl-s flow-sub" x="0" y="366">Dashboards by different teams</text>
      <text class="lbl" x="0" y="430">Act</text><text class="lbl-s flow-sub" x="0" y="454">Which version to believe?</text>
    </g>
    <circle class="ball" id="flow-ball" cx="515.8" cy="82" r="10"/>
  </svg>
</div>
    </div>
  </div>
</section>
HTML

# One screen isn't one truth: the spectrum, from a dashboard of dots to one source (drawn by scripts.js)
truth_spectrum = <<~HTML
  <div class="stage viz truth-viz" id="truth">
    <svg viewBox="0 0 1000 440" role="img" aria-label="A dashboard's data moves along a spectrum, from a single pane of glass that puts all your data on one screen, to a single source of truth, where everyone agrees what each number means, where it comes from and who owns it."></svg>
  </div>
  <p class="block-note" data-reveal="top 85%"><span>You can have the first without the second, and then a new dashboard simply shows the disagreement more efficiently.</span></p>
HTML

# CLEAR Discovery, reinterpreted from slide 4 of the Magnifico CLEAR Discovery deck for a light page:
# five steps rise as a staircase; each names its outcome and links to the chapters that apply it.
clear_steps = [
  ["01", "Context", "Understand the business goals, product, users, workflows, constraints and success criteria.", "Current-state experience map", nil, nil],
  ["02", "Listen", "Talk to stakeholders, users and teams to understand their needs, challenges and perspectives.", "Stakeholder and user insights", "Steps 1 and 2", "step-1-listen"],
  ["03", "Examine", "Review the product, workflows, data, support signals and existing research to identify where friction is happening.", "Experience friction audit", "Step 3", "step-3-source"],
  ["04", "Align", "Synthesize what we’ve learned, identify root causes and connect experience problems to business consequences.", "Prioritized opportunity map", "Step 4", "step-4-align"],
  ["05", "Roadmap", "Prioritize the highest-impact opportunities and define a practical roadmap for what to tackle now, next and later.", "Product experience roadmap", "Step 5", "step-5-decisions"],
]
stairs = clear_steps.each_with_index.map { |(n, name, text, outcome, ch, slug), i|
  link = ch ? %(<a class="stair-link" href="../#{slug}/">#{ch} #{ARROW}</a>) : %(<span class="stair-link is-here">This introduction</span>)
  %(  <li class="stair" style="--i:#{i}">
    <div class="stair-in">
      <span class="stair-num">#{n}</span>
      <h3 class="stair-name">#{name}</h3>
      <p class="stair-text">#{text}</p>
      <div class="stair-out">#{link}</div>
    </div>
  </li>)
}.join("\n")
steps_list = <<~HTML
  <div class="clear" id="clear">
    <ol class="stairs" aria-label="The CLEAR discovery process">
  #{stairs}
    </ol>
    <span class="stairs-base" aria-hidden="true"></span>
    <a class="clear-next" href="../step-6-test/"><span><span class="stair-num">06</span> Then a final step for building with confidence: <b>Test before you build</b></span>#{ARROW}</a>
  </div>
HTML

page(0, "The Dashboard Isn’t the Problem",
  [["the-meeting", "You know this meeting"], ["where-trust-is-lost", "Where trust is lost"], ["one-truth", "One screen, one truth"], ["how-it-works", "How this playbook works"]],
  hero("Context<span class=\"sep\">|</span>Introduction", "The Dashboard Isn’t the Problem",
       "Why another dashboard rarely fixes operational data, and the six steps that do.", "00") +
  people("the-meeting", "You know this meeting",
    "If you lead operations at an energy company, you probably know this meeting. <strong>The numbers are on the screen, and nobody agrees on them.</strong>",
    ["One team’s figure doesn’t match another’s. Someone has a spreadsheet that tells a different story. Most of the hour goes to reconciling the numbers, and very little goes to deciding what to do about them.",
     "The usual response is to ask for a better dashboard: one screen, all the data, finally in one place. It’s a reasonable request, and it rarely works. <strong>Not because the dashboard is badly built, but because the problem it’s meant to solve sits underneath it.</strong>"], ROOTS) +
  trust_section +
  block("one-truth", "One screen isn’t one truth",
    ["That’s the distinction at the heart of this playbook."], nil, truth_spectrum) +
  block("how-it-works", "How this playbook works",
    ["The playbook follows Magnifico’s CLEAR discovery process (Context, Listen, Examine, Align, Roadmap) and adds a final step for building with confidence. Six steps, one chapter each. Every chapter explains the step, shows you how to apply it in your own organization, and ends with an example from our work with an oil and gas company that went through the same process, from the first interviews to a delivered platform."],
    nil, steps_list) +
  next_band("Next · <b>Step 1</b>", "Listen before you design", "../step-1-listen/"),
  script_key: "intro")

# ───────────────────────── 01 · Listen (existing chapter, now on the shared template) ─────────────────────────
s1 = S1_BODY.sub('<div class="frag-top">', '<div class="frag-top" data-reveal>')
            .sub('<div class="groups" id="groups" style="margin-top:40px">', '<div class="groups" id="groups" data-bullets style="margin-top:40px">')
page(1, "Listen Before You Design",
  [["start-with-people", "Start with people"], ["how-to-apply", "How to apply it"], ["in-the-field", "In the field"], ["fragmentation", "Fragmentation sources"]],
  hero("Listen<span class=\"sep\">|</span>Step 1", "Listen Before You Design",
       "Start with people and their workarounds. Interviews reveal the habits, incentives and gaps behind fragmented information.", "01") +
  "\n" + s1 + "\n" +
  next_band("Next · <b>Step 2</b>", "Know who decides what", "../step-2-decide/"))

# ───────────────────────── 02 · Know who decides what ─────────────────────────
roles = [
  ["exec", "Operations executive", "A concise, trustworthy view of performance and exceptions.", "Too many measures with too little context.", "Seconds: are operations healthy, and where aren’t they?"],
  ["reliability", "Reliability specialist", "One reliable view of equipment health.", "Conflicting information and duplicate data entry.", "Asset by asset"],
  ["maintenance", "Maintenance lead", "Fast access to operational signals and the detail behind them.", "Delayed reporting and disconnected tools.", "Signal, then the detail behind it"],
  ["project", "Project manager", "Visibility into progress, risks and dependencies.", "Scattered project information.", "Progress across every workstream"],
  ["engineering", "Engineering manager", "Timely information for proactive decisions.", "Limited access to detail they could depend on.", "Down to a single asset’s history"],
]
role_tabs = roles.each_with_index.map { |(k, n, need, fr, _), i|
  %(<button class="role-tab" type="button" role="tab" id="tab-#{k}" aria-controls="role-view" aria-selected="#{i.zero?}" data-role="#{k}"><span class="r-dot" aria-hidden="true"></span><span class="r-name">#{n}</span><span class="r-need"><b>Needs</b> #{need[0].downcase + need[1..]}<br><b>Slowed by</b> #{fr[0].downcase + fr[1..]}</span></button>)
}.join("\n        ")
tiles = (0...9).map { |i| %(<div class="tile" data-t="#{i}"><i class="k#{i == 1 ? ' p' : ''}"></i><i style="width:72%"></i><i style="width:48%"></i><svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><path class="ln" d="M0 #{22 - i % 3 * 3} C20 #{10 + i % 4 * 4} 35 26 50 #{14 + i % 2 * 6} S80 #{6 + i % 3 * 5} 100 #{12 + i % 4 * 3}" vector-effect="non-scaling-stroke"/></svg></div>) }.join
roles_viz = <<~HTML
  <div class="roles" data-reveal="top 80%">
    <div class="role-tabs" role="tablist" aria-label="Roles">
      #{role_tabs}
    </div>
    <div class="stage role-view" id="role-view" role="tabpanel" aria-live="polite">
      <div class="view-head"><span class="v-title">One sample view, reshaped for <span id="role-name">Operations executive</span></span><span class="v-depth" id="role-depth">#{roles[0][4]}</span></div>
      <div class="board" id="board">#{tiles}</div>
    </div>
  </div>
HTML
page(2, "Know Who Decides What",
  [["design-for-decisions", "Design for decisions"], ["how-to-apply", "How to apply it"], ["in-the-field", "In the field"], ["five-roles", "Five roles, one truth"]],
  hero("Listen<span class=\"sep\">|</span>Step 2", "Know Who Decides What",
       "Everyone works from the same truth, at the depth their decisions need.", "02") +
  people("design-for-decisions", "Design for decisions",
    "Every operational dashboard eventually disappoints someone. Executives find it too detailed. Engineers find it too shallow. <strong>That’s what happens when you design for “users” instead of for decisions.</strong>",
    ["One shared experience doesn’t mean everyone sees the same screen. It means everyone works from the same truth, at the depth their decisions need. An executive needs to know in seconds whether operations are healthy and where they aren’t. A reliability engineer needs to follow that signal down to a single asset."]) +
  howto([
    ["Roles", "Find the roles that keep coming up in your interviews.", "Most organizations have three to six that matter."],
    ["Decisions", "Define each role by its decisions, not its job title.", "Write down the decisions it makes most often, the information each decision needs, and how fresh and how detailed that information has to be."],
    ["Signal", "Separate signal from noise.", "Ask what each role looks at first and what it never looks at. Both answers shape the design."],
    ["Habits", "Respect existing habits.", "Note the tools each role already relies on. Whatever you build has to be better than the spreadsheet it replaces, or people will go back to the spreadsheet."],
  ]) +
  field(["At the oil and gas company, five roles kept appearing, each with a clear need and its own kind of friction."],
    [[5, "Roles", 2], [1000, "KPIs in use", 0]],
    quote("[W]e have 1000 KPIs and they’re all over the place. That’s not realistic to do a quick eye shot and say, all right, are we doing good?")) +
  block("five-roles", "Five roles, one truth",
    ["Choose a role to see its primary need, its typical friction, and how the same view reshapes to its level of detail."],
    pull("Most of the time people tend to gravitate back towards existing tools, legacy systems spreadsheets that they’re already using."),
    roles_viz) +
  next_band("Next · <b>Step 3</b>", "Follow the data to its source", "../step-3-source/"),
  script_key: "roles")

# ───────────────────────── 03 · Follow the data to its source ─────────────────────────
trace_svg = <<~SVG
  <div class="stage viz" id="trace">
    <svg viewBox="0 0 1000 330" role="img" aria-label="One metric leaves its source as a single line, splits into conflicting copies through spreadsheets and dashboards, and only rejoins where a definition is agreed.">
      <path class="ln t-src" d="M90 165H250" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" stroke-opacity=".7"/>
      <path class="ln t-copy" d="M250 165C320 165 330 70 420 70H640C730 70 760 165 830 165" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" stroke-opacity=".45"/>
      <path class="ln t-copy" d="M250 165H830" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" stroke-opacity=".45"/>
      <path class="ln t-copy" d="M250 165C320 165 330 260 420 260H640C730 260 760 165 830 165" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" stroke-opacity=".45"/>
      <path class="ln t-out" d="M830 165H940" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" stroke-opacity=".7"/>
      <circle class="ball" cx="90" cy="165" r="12"/>
      <text class="lbl" x="90" y="210" text-anchor="middle">Source</text>
      <g class="t-vals">
        <g><rect class="node" x="380" y="48" width="104" height="44" rx="6"/><text class="lbl-num" x="432" y="75" text-anchor="middle">1,240</text><text class="lbl-s" x="432" y="36" text-anchor="middle">Spreadsheet</text></g>
        <g><rect class="node" x="380" y="143" width="104" height="44" rx="6"/><text class="lbl-num" x="432" y="170" text-anchor="middle">1,198</text><text class="lbl-s" x="432" y="131" text-anchor="middle">Team dashboard</text></g>
        <g><rect class="node" x="380" y="238" width="104" height="44" rx="6"/><text class="lbl-num" x="432" y="265" text-anchor="middle">1,305</text><text class="lbl-s" x="432" y="226" text-anchor="middle">Monthly report</text></g>
        <g><rect class="node" x="560" y="48" width="96" height="44" rx="6"/><text class="lbl-num" x="608" y="75" text-anchor="middle">1,251</text></g>
        <g><rect class="node" x="560" y="238" width="96" height="44" rx="6"/><text class="lbl-num" x="608" y="265" text-anchor="middle">1,187</text></g>
      </g>
      <g class="t-agree">
        <circle class="ball" cx="830" cy="165" r="14"/>
        <text class="lbl" x="830" y="214" text-anchor="middle">Agreed definition</text>
        <text class="lbl-s" x="830" y="238" text-anchor="middle">One owner</text>
      </g>
    </svg>
  </div>
SVG
page(3, "Follow the Data to Its Source",
  [["integration-and-trust", "Integration and trust"], ["how-to-apply", "How to apply it"], ["in-the-field", "In the field"], ["one-number", "One number, many copies"]],
  hero("Examine<span class=\"sep\">|</span>Step 3", "Follow the Data to Its Source",
       "Integration and trust are different things. Trust has to be fixed where the data is born.", "03") +
  people("integration-and-trust", "Integration and trust",
    "Once you know who needs what, check whether your data can deliver it. This is where most organizations discover that <strong>integration and trust are different things.</strong>",
    ["If three copies of a number disagree today, putting them side by side on one screen only makes the disagreement easier to see. Trust has to be fixed where the data is born and everywhere it gets changed along the way."]) +
  howto([
    ["Metrics", "Pick a few critical metrics.", "Start with the handful your leadership relies on most, not every system you own."],
    ["Trace", "Trace each one end to end.", "From the system where it’s created to the meeting where it’s used. Note every copy, every change of definition, and every point where a person re-keys or adjusts it."],
    ["Retire", "Ask what should have been retired.", "Old dashboards and legacy tools running alongside new ones keep competing versions alive."],
    ["Owners", "Name an owner for each definition, even provisionally.", "A number nobody owns will drift again."],
    ["Together", "Do it with operations and IT in the same room.", "Neither can see the whole path alone."],
  ]) +
  field(["At the oil and gas company, we examined seven kinds of operational information: reliability, integrity, process optimization, projects, condition monitoring, regulatory reporting and production."],
    [[7, "Kinds of operational information", 2]],
    quote("There’s too much data. Nothing gets retired.")) +
  block("one-number", "One number, many copies",
    ["The same patterns appeared in almost all of them. Data was copied between systems and spreadsheets, definitions shifted, figures were reconciled by hand, and new dashboards arrived without the old ones ever leaving."],
    pull("[The] foundation is not solid. So everything on top of it is just trying to band aid, aggregate those sources together, so it looks like it came from one place."),
    trace_svg) +
  next_band("Next · <b>Step 4</b>", "Agree on what matters", "../step-4-align/"),
  script_key: "trace")

# ───────────────────────── 04 · Agree on what matters ─────────────────────────
qs = ["Changes a decision?", "Several roles rely on it?", "Does the data exist?", "Can it be trusted?", "Matters to the business?"]
cats = ["Safety", "Quality", "Delivery", "Cost", "People"]
gates = qs.each_with_index.map { |q, i| x = 300 + i * 105; %(<g class="s-gate"><line class="gd" x1="#{x}" y1="70" x2="#{x}" y2="420" stroke-dasharray="3 5" style="stroke-opacity:.35"/><text class="lbl-s" x="#{x}" y="#{i.even? ? 40 : 58}" text-anchor="middle">#{q}</text></g>) }.join
catl = cats.each_with_index.map { |c, i| y = 120 + i * 62; %(<g class="s-cat"><text class="lbl" x="905" y="#{y + 5}">#{c}</text></g>) }.join
sieve_svg = <<~SVG
  <div class="stage viz" id="sieve">
    <svg viewBox="0 0 1000 440" role="img" aria-label="A dense cloud of measures filters through five questions and settles into five categories: Safety, Quality, Delivery, Cost and People.">
      #{gates}
      #{catl}
      <g id="sieve-dots"></g>
    </svg>
  </div>
SVG
page(4, "Agree on What Matters",
  [["findings-first", "Findings first"], ["how-to-apply", "How to apply it"], ["in-the-field", "In the field"], ["few-measures", "From many measures to a few"]],
  hero("Align<span class=\"sep\">|</span>Step 4", "Agree on What Matters",
       "Share findings before you design, then choose a few measures and let the rest go.", "04") +
  people("findings-first", "Findings first",
    "By now you understand the problem better than almost anyone in your organization. <strong>Resist the urge to start designing.</strong>",
    ["A dashboard designed before people agree on the problem becomes one more opinion in the room. Findings shared first become common ground, and common ground is what lets you make the hard call this step requires: choosing a few measures and letting the rest go."]) +
  howto([
    ["Themes", "Group what you heard into a few themes.", "Trust, focus, consistency and adoption are a good starting frame."],
    ["Readout", "Hold a readout before any design work.", "Bring leaders, users and IT together, walk through the findings, and agree on the top priorities in the room."],
    ["Questions", "Test every candidate measure against the same questions.", "Does it change a decision? Do several roles rely on it? Does the data exist? Can it be trusted? Does it matter to the business?"],
    ["Categories", "Group what survives into a handful of categories.", "Give each measure one written definition and one owner."],
    ["Let go", "Decide what you’ll stop reporting.", "Choosing what matters means choosing what doesn’t."],
  ]) +
  field(["At the oil and gas company, the findings came down to four needs, and from those came six opportunities.",
         "Simplifying the metrics stood out as high value for relatively little effort; standardizing and reducing duplication took more cross-functional work but were essential for anything to last."],
    [[4, "Needs", 2], [6, "Opportunities", 2]],
    aside([["Four needs", ["Trust in the data", "Focus on what mattered", "Consistency across systems", "Adoption of tools that fit real work"]],
           ["Six opportunities", ["Simplify the metrics", "Design for roles", "Connect context", "Standardize the data", "Reduce duplication", "Enable adoption"]]])) +
  block("few-measures", "From many measures to a few",
    ["The platform was ultimately built around five categories: Safety, Quality, Delivery, Cost and People (SQDCP), each with a small set of supporting metrics. SQDCP fit this operator. Your categories may differ. What carries over is the discipline: few categories, chosen on purpose, with every measure defined once and owned by someone."],
    nil, sieve_svg) +
  next_band("Next · <b>Step 5</b>", "Design around decisions", "../step-5-decisions/"),
  script_key: "sieve")

# ───────────────────────── 05 · Design around decisions ─────────────────────────
path_steps = [
  ["Signal", "Something needs attention.", "Gas compression availability on one platform drops below its target.", "Tells someone that something needs attention."],
  ["Context", "What it means.", "One compressor has tripped twice in 24 hours, and the other two trains are running near capacity.", "Tells them what it means."],
  ["Investigation", "Why it’s happening.", "The trip log points to high discharge temperature, and the cooler was due for cleaning last week.", "Lets them dig into the cause."],
  ["Action", "Close the loop.", "The maintenance lead schedules the cleaning, and production adjusts the plan for the next shift.", "Closes the loop."],
]
pbtns = path_steps.each_with_index.map { |(n, *), i| %(<button class="path-step#{i.zero? ? ' is-reached' : ''}" type="button" role="tab" aria-selected="#{i.zero?}" data-i="#{i}"><span class="p-dot" aria-hidden="true"></span><span class="p-name">#{n}</span></button>) }.join
path_viz = <<~HTML
  <div class="stage pathway" data-reveal="top 80%">
    <div class="path-steps" role="tablist" aria-label="Decision path"><span class="path-fill" id="path-fill"></span>#{pbtns}</div>
    <div class="path-card" role="tabpanel" aria-live="polite">
      <div class="path-copy">
        <span class="pc-label" id="pc-label">#{path_steps[0][0]} · #{path_steps[0][3]}</span>
        <p class="pc-title" id="pc-title">#{path_steps[0][2]}</p>
        <p class="pc-note">An example alert, followed from first signal to action.</p>
        <div class="path-nav"><button type="button" id="path-prev" disabled>Back</button><button type="button" class="is-primary" id="path-next">Next: Context</button></div>
      </div>
      <svg class="viz" id="path-art" viewBox="0 0 420 260" aria-hidden="true">
        <rect class="node" x="10" y="10" width="400" height="240" rx="8" style="stroke-opacity:.2"/>
        <g data-s="0"><rect class="node is-pink" x="30" y="30" width="150" height="72" rx="6"/><circle class="ball" cx="52" cy="52" r="7"/><path class="ln" d="M68 52h86M46 80h70" stroke-opacity=".4"/></g>
        <g data-s="1"><rect class="node" x="196" y="30" width="194" height="72" rx="6" style="stroke-opacity:.4"/><path class="ln" d="M212 86C240 84 250 50 280 60S330 40 374 46" stroke-opacity=".6"/><circle cx="374" cy="46" r="4" fill="#ff0074"/></g>
        <g data-s="2"><rect class="node" x="30" y="118" width="360" height="80" rx="6" style="stroke-opacity:.4"/><path class="ln" d="M46 138h120M46 158h220M46 178h160" stroke-opacity=".35"/><path class="ln" d="M280 182l24-30 20 14 26-34" stroke-opacity=".7"/></g>
        <g data-s="3"><rect class="node is-pink" x="30" y="212" width="220" height="26" rx="13"/><path class="ln" d="M44 225l6 6 12-12" stroke="#ff0074"/><path class="ln" d="M74 225h150" stroke-opacity=".4"/></g>
      </svg>
    </div>
  </div>
HTML
views = [
  ["Hurricane map view for severe-weather planning", '<path class="ln" d="M10 70C30 62 40 74 60 66S88 70 96 60" stroke-opacity=".4"/><path class="ln" d="M62 34a10 10 0 1 1-9 13 15 15 0 1 0 22-17" stroke-opacity=".85"/><circle cx="62" cy="38" r="3.5" fill="#ff0074"/><path class="ln" d="M20 86l10-8 10 6 12-10" stroke-opacity=".3" stroke-dasharray="2 4"/>'],
  ["Price per barrel for market context", '<path class="ln" d="M22 30h30v52H22zM22 44h30M22 68h30" stroke-opacity=".55"/><path class="ln" d="M60 74l10-12 9 6 15-24" stroke-opacity=".85"/><circle cx="94" cy="44" r="3.5" fill="#ff0074"/>'],
  ["Flaring by platform, how much and for how long", '<path class="ln" d="M18 86h40M24 86V58h28v28M30 58V44h16v14M38 44V30" stroke-opacity=".55"/><path class="ln" d="M38 30c-6-6 0-12 0-18 4 6 8 10 2 18" stroke="#ff0074"/><path class="ln" d="M68 86V66M78 86V54M88 86V72" stroke-opacity=".7"/>'],
  ["A 3D model of a booster gas compressor, with metrics on the equipment", '<path class="ln" d="M20 62l30-16 30 16-30 16zM20 62v16l30 16 30-16V62M50 78v16" stroke-opacity=".6"/><ellipse class="ln" cx="66" cy="44" rx="10" ry="5" stroke-opacity=".6"/><path class="ln" d="M56 44v14M76 44v14" stroke-opacity=".6"/><path class="ln" d="M66 30v-10h18" stroke-opacity=".5"/><circle cx="88" cy="20" r="3.5" fill="#ff0074"/>'],
  ["Underwater views of pipelines and the wells they tap into", '<path class="ln" d="M8 30c12-6 18 6 30 0s18-6 30 0 18 6 30 0" stroke-opacity=".4"/><path class="ln" d="M30 30v34h40v22M70 64h20v22" stroke-opacity=".7"/><circle class="node" cx="70" cy="88" r="5"/><circle cx="90" cy="88" r="5" fill="#ff0074"/><path class="ln" d="M10 92h90" stroke-opacity=".3"/>'],
]
views_html = views.map { |cap, art| %(<li class="view"><svg class="viz" viewBox="0 0 110 110" aria-hidden="true">#{art}</svg><h3>#{cap}</h3></li>) }.join
tiers = <<~HTML
  <div class="tiers" data-reveal="top 80%">
    <svg class="viz" id="pyramid" viewBox="0 0 420 300" role="img" aria-label="An information pyramid with three tiers: always visible at the top, on demand in the middle, on investigation at the base.">
      <path class="tier" d="M210 20L280 110H140Z" fill="#ff0074"/>
      <path class="tier" d="M134 120H286L346 200H74Z" fill="#00424f"/>
      <path class="tier" d="M68 210H352L412 290H8Z" fill="#d5def0"/>
    </svg>
    <ol class="tier-list">
      <li><span class="t-key" style="background:#ff0074"></span><h3>Always visible</h3><p>Keep the first tier small.</p></li>
      <li><span class="t-key" style="background:#00424f"></span><h3>Available on demand</h3><p>Useful only on request.</p></li>
      <li><span class="t-key" style="background:#d5def0"></span><h3>Revealed during investigation</h3><p>Only matters once someone starts investigating.</p></li>
    </ol>
  </div>
  <p class="block-sub" data-reveal="top 90%"><span>Context views at the oil and gas company, each added because it made a decision faster or clearer.</span></p>
  <ul class="views" data-reveal="top 90%">#{views_html}</ul>
HTML
page(5, "Design Around Decisions",
  [["daily-friction", "Start with daily friction"], ["signal-to-action", "From signal to action"], ["how-to-apply", "How to apply it"], ["in-the-field", "In the field"], ["what-goes-where", "What goes where"]],
  hero("Roadmap<span class=\"sep\">|</span>Step 5", "Design Around Decisions",
       "Start where friction shows up every day, and design the path from signal to action.", "05") +
  people("daily-friction", "Start with daily friction",
    "With priorities agreed, decide where to start and how information should be organized. <strong>Start where friction shows up every day.</strong>",
    ["The last step of CLEAR is a roadmap: what to tackle now, what comes next, and what can wait.",
     "Then design around a simple path. A signal tells someone that something needs attention. Context tells them what it means. Investigation lets them dig into the cause. Action closes the loop. Most dashboards stop at the signal: a red tile, and then you’re on your own."]) +
  block("signal-to-action", "From signal to action",
    ["Follow one alert along the path. Most dashboards stop at the first step."], nil, path_viz) +
  howto([
    ["Start", "Choose your starting point.", "Pick the experience people use every day and struggle with most. For many operators, that’s daily reporting and exception handling."],
    ["Focus", "Pick one role and one recurring decision.", "Design that well before designing everything."],
    ["Path", "Define the path.", "The signal that should catch attention, the context needed to understand it, the route for investigating it, and the action that resolves it."],
    ["Tiers", "Sort information into three tiers.", "Always visible, available on demand, and revealed during investigation. Keep the first tier small."],
    ["Context", "Add context only when you can name the decision it supports.", "Maps, 3D models and live market data are powerful when they make a decision faster or clearer, and decoration when they don’t."],
  ]) +
  field(["The oil and gas company started with daily reporting and exception management, built on its SQDCP core. Context was added only where it helped a decision.",
         "Each view earned its place because some questions are easier to answer when you can see where something is and what it’s connected to."],
    [[5, "Context views", 2]],
    aside([["Where they started", ["Daily reporting", "Exception management", "Built on the SQDCP core"]],
           ["Context, only where it helped", ["Hurricane map", "Price per barrel", "Flaring by platform", "Booster gas compressor in 3D", "Underwater pipelines and wells"]]])) +
  block("what-goes-where", "What goes where",
    ["That path also decides what goes where on the screen. Some information has to be visible at all times. Some is useful only on request. Some only matters once someone starts investigating. Important doesn’t mean equal space."],
    nil, tiers) +
  next_band("Next · <b>Step 6</b>", "Test before you build", "../step-6-test/"),
  script_key: "path")

# ───────────────────────── 06 · Test before you build ─────────────────────────
loop_svg = <<~SVG
  <div class="stage viz" id="loop">
    <svg viewBox="0 0 1000 340" role="img" aria-label="A loop of prototype, test and refine, then a hand-off to a blueprint, a delivered platform and a predictive layer built on it.">
      <circle class="gd" cx="210" cy="170" r="120" style="stroke-opacity:.3"/>
      <path class="ln l-ring" d="M210 50A120 120 0 1 1 209.9 50" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" stroke-opacity=".55"/>
      <g text-anchor="middle">
        <circle class="node" cx="210" cy="50" r="8"/><text class="lbl" x="210" y="26">Prototype</text>
        <circle class="node" cx="314" cy="230" r="8"/><text class="lbl" x="350" y="268">Test</text>
        <circle class="node" cx="106" cy="230" r="8"/><text class="lbl" x="70" y="268">Refine</text>
      </g>
      <path class="ln l-out" d="M330 170H520" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" stroke-opacity=".55"/>
      <text class="lbl-s l-hand" x="425" y="156" text-anchor="middle">Hand off</text>
      <g class="l-blue">
        <rect class="node" x="530" y="110" width="96" height="120" rx="6"/>
        <path class="ln" d="M548 136h60M548 156h44M548 176h56M548 196h36" stroke-opacity=".35"/>
        <text class="lbl" x="578" y="262" text-anchor="middle">Blueprint</text>
      </g>
      <path class="ln l-out2" d="M636 170H690" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" stroke-opacity=".55"/>
      <g class="l-plat">
        <rect class="node" x="700" y="150" width="270" height="80" rx="6"/>
        <path class="ln" d="M718 172h70M718 192h120M718 212h90" stroke-opacity=".35"/>
        <text class="lbl" x="835" y="262" text-anchor="middle">Delivered platform</text>
      </g>
      <g class="l-pred">
        <rect class="node is-pink" x="700" y="70" width="270" height="64" rx="6"/>
        <path class="ln" d="M716 112C760 112 770 86 800 92S860 80 900 96" stroke-opacity=".5"/>
        <path class="ln" d="M900 96C920 104 936 90 954 84" stroke="#ff0074" stroke-dasharray="3 5"/>
        <circle class="ball" cx="954" cy="84" r="6"/>
        <text class="lbl" x="835" y="54" text-anchor="middle">Predictive layer</text>
      </g>
      <circle class="ball" id="loop-ball" cx="210" cy="50" r="11"/>
    </svg>
  </div>
SVG
page(6, "Test Before You Build",
  [["cheapest-place", "The cheapest place to be wrong"], ["how-to-apply", "How to apply it"], ["in-the-field", "In the field"], ["prototype-to-platform", "From prototype to platform"]],
  hero("Design, validate, deliver<span class=\"sep\">|</span>Step 6", "Test Before You Build",
       "A prototype is the cheapest place to be wrong. Test it with the people who will use it.", "06") +
  people("cheapest-place", "The cheapest place to be wrong",
    "CLEAR ends with a plan. This step is about what happens when that plan meets the people who will use it. <strong>A prototype is the cheapest place to be wrong.</strong>",
    ["Moving a metric, cutting a view or reworking a flow takes hours in a prototype. After development, the same change costs far more. A clickable prototype with realistic data feels close enough to the real thing that people react honestly, without anyone writing production code."]) +
  howto([
    ["Prototype", "Prototype one or two decision flows, not the whole platform.", "Use realistic data so gaps show up now rather than after launch."],
    ["Test", "Test with the people who will use it.", "Give them real tasks rather than a demo, and watch where they hesitate."],
    ["Hierarchy", "Ask the hierarchy questions.", "What deserves to be prominent? What’s secondary? What must be visible immediately, and what can live one level down? Does this match how people think about the operation?"],
    ["Refine", "Refine and test again.", "Do it before committing development resources."],
    ["Blueprint", "Hand engineering a blueprint, not just screens.", "Include where each number comes from, how it’s defined, who owns it, and what data is still missing."],
    ["Foundation", "Plan for what a trusted foundation makes possible.", "Predictive analytics are only as good as the data beneath them. Built on competing versions of the truth, a model predicts the wrong things faster. Built on agreed, owned data, it can see trouble coming."],
  ]) +
  field(["At the oil and gas company, a validated clickable prototype became the blueprint for engineering. The platform was then developed and delivered.",
         "With data it could trust, the operator went further and now runs predictive machine-learning models in-house that flag delivery and flow-management issues, the kind of problems that could otherwise shut down operations."],
    [],
    aside([["The blueprint for engineering", ["Interface", "Interactions", "Information hierarchy", "User flows"]],
           ["Built on it", ["A delivered platform", "Predictive machine-learning models, run in-house"]]])) +
  block("prototype-to-platform", "From prototype to platform",
    ["Prototype, test and refine until the design holds. Then hand off a blueprint, deliver the platform, and build the predictive layer on data people trust."],
    nil, loop_svg) +
  next_band("Next · <b>Where to start</b>", "Your first moves", "../where-to-start/"),
  script_key: "loop")

# ───────────────────────── 07 · Where to start ─────────────────────────
moves = [
  ['<path class="ln" d="M8 18h38v24H24l-8 8v-8H8z" stroke-opacity=".7"/><path class="ln" d="M30 48v8h18l8 8v-8h8V32H52" stroke-opacity=".45"/><circle cx="56" cy="20" r="5" fill="#ff0074"/>', "Have a handful of honest conversations across functions about how people really work with operational data."],
  ['<path class="ln" d="M6 58C22 58 22 20 38 20S54 44 66 44" stroke-opacity=".55"/><circle cx="6" cy="58" r="5" fill="#ff0074"/><circle class="node" cx="66" cy="44" r="5"/>', "Trace one metric your leadership relies on, from where it’s born to where it’s used."],
  ['<path class="ln" d="M6 36h14M30 36h14M54 36h12" stroke-opacity=".55"/><circle cx="12" cy="36" r="5" fill="#ff0074"/><circle class="node" cx="36" cy="36" r="5"/><circle class="node" cx="60" cy="36" r="5"/><path class="ln" d="M56 22l6-6 6 6" stroke-opacity=".5"/>', "Sketch one decision flow, from the first signal to the action that resolves it."],
]
moves_html = %(<div class="moves" data-reveal="top 85%">) + moves.map { |art, t| %(<div class="move"><svg class="viz" viewBox="0 0 72 72" aria-hidden="true">#{art}</svg><p>#{t}</p></div>) }.join + "</div>"
start_body = <<~HTML
  #{moves_html}
  <p class="closing" data-reveal="top 90%"><span>Each of those will tell you more about your real problem <strong>than another dashboard would.</strong></span></p>
HTML
cta = <<~HTML
  <section class="sec" id="assessment" data-section="assessment" aria-labelledby="t-assessment">
    <div class="panel cta">
      <div class="cta-art" aria-hidden="true"><svg viewBox="0 0 600 600" id="cta-art"></svg></div>
      <h2 class="h2" id="t-assessment">How ready is your organization to go from data to decisions?</h2>
      <p>The Data to Decision Assessment uses the same CLEAR steps to show you which practices you already have in place, where the gaps are, and what to tackle first.</p>
      <button class="btn" type="button" data-soon="The assessment launches soon">Take the Data to Decision Assessment #{ARROW}</button>
    </div>
  </section>
HTML
page(7, "Where to Start",
  [["the-short-version", "The short version"], ["start-this-month", "Start this month"], ["assessment", "The assessment"]],
  hero("Where to start", "Where to Start",
       "You can start this month, without new technology.", "07") +
  people("the-short-version", "The short version",
    "You don’t fix operational data by buying a better dashboard. <strong>You fix it by listening to your people, following your data back to its source, agreeing on what matters, designing around real decisions, and testing before you build.</strong>",
    ["Advanced capabilities come last, because they depend on everything before them."]) +
  block("start-this-month", "Start this month",
    ["You can start this month, without new technology:"], nil, start_body) +
  cta +
  next_band("Back to the beginning", "The Dashboard Isn’t the Problem", "../intro/"),
  script_key: "start")
